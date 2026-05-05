import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
const serverEntry = fileURLToPath(new URL('../server/src/index.js', import.meta.url));
const testEmail = `smoke${Date.now()}@example.com`;
const password = 'secret123';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@designer.store';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456';

let cookieHeader = '';
let serverProcess = null;
let startedServer = false;
let serverLogs = '';

function appendServerLog(chunk) {
  serverLogs += chunk.toString();
  if (serverLogs.length > 4000) {
    serverLogs = serverLogs.slice(-4000);
  }
}

function updateCookie(response) {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return;
  cookieHeader = setCookie.split(';')[0];
}

async function requestJson(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  updateCookie(response);

  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;

  if (options.expectedStatus && response.status !== options.expectedStatus) {
    throw new Error(
      `${options.method || 'GET'} ${path} returned ${response.status} instead of ${options.expectedStatus}\n` +
      `${JSON.stringify(data, null, 2)}`
    );
  }

  return data;
}

async function isHealthy() {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data?.ok === true;
  } catch {
    return false;
  }
}

async function waitForHealth(timeoutMs = 15000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isHealthy()) {
      return;
    }
    await delay(500);
  }

  throw new Error(`Backend did not become healthy within ${timeoutMs}ms.\n${serverLogs}`);
}

async function ensureServer() {
  if (await isHealthy()) {
    return;
  }

  startedServer = true;
  serverProcess = spawn(process.execPath, [serverEntry], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', appendServerLog);
  serverProcess.stderr.on('data', appendServerLog);

  await waitForHealth();
}

async function stopServer() {
  if (!serverProcess) return;

  serverProcess.kill();
  await delay(500);
}

async function run() {
  await ensureServer();

  const health = await requestJson('/api/health', { expectedStatus: 200 });
  const products = await requestJson('/api/products?featuredLimit=4', { expectedStatus: 200 });
  const productId = products?.products?.[0]?.id || 101;

  const signup = await requestJson('/api/auth/signup', {
    method: 'POST',
    expectedStatus: 201,
    body: {
      firstName: 'Smoke',
      lastName: 'Tester',
      birthDate: '2000-01-01',
      gender: 'Male',
      email: testEmail,
      password
    }
  });

  const login = await requestJson('/api/auth/login', {
    method: 'POST',
    expectedStatus: 200,
    body: {
      email: testEmail,
      password
    }
  });

  const currentUser = await requestJson('/api/auth/me', { expectedStatus: 200 });

  await requestJson(`/api/favorites/${productId}`, {
    method: 'PUT',
    expectedStatus: 200
  });

  const favorites = await requestJson('/api/favorites', { expectedStatus: 200 });

  const order = await requestJson('/api/orders', {
    method: 'POST',
    expectedStatus: 201,
    body: {
      fullName: 'Smoke Tester',
      email: testEmail,
      phone: '01000000000',
      whatsapp: '01000000000',
      city: 'Cairo',
      address: 'Test Street 12',
      notes: 'Smoke order',
      paymentMethod: 'cash',
      items: [
        {
          id: productId,
          qty: 1
        }
      ]
    }
  });

  const orders = await requestJson('/api/orders/me', { expectedStatus: 200 });

  await requestJson('/api/auth/logout', {
    method: 'POST',
    expectedStatus: 200
  });

  const afterLogout = await requestJson('/api/auth/me', { expectedStatus: 200 });

  const adminLogin = await requestJson('/api/auth/login', {
    method: 'POST',
    expectedStatus: 200,
    body: {
      email: adminEmail,
      password: adminPassword
    }
  });

  const adminOverview = await requestJson('/api/admin/overview', { expectedStatus: 200 });
  const adminOrders = await requestJson('/api/admin/orders', { expectedStatus: 200 });
  const updatedOrder = await requestJson(`/api/admin/orders/${order.order.id}/status`, {
    method: 'PATCH',
    expectedStatus: 200,
    body: {
      status: 'confirmed'
    }
  });

  const summary = {
    service: health?.service,
    signupEmail: signup?.user?.email,
    loginEmail: login?.user?.email,
    currentUserEmail: currentUser?.user?.email,
    favoriteCount: favorites?.favorites?.length || 0,
    orderReference: order?.order?.reference || '',
    myOrdersCount: orders?.orders?.length || 0,
    loggedOut: afterLogout?.user === null,
    adminEmail: adminLogin?.user?.email,
    adminRevenue: adminOverview?.stats?.revenue || 0,
    adminOrdersCount: adminOrders?.orders?.length || 0,
    updatedOrderStatus: updatedOrder?.order?.status || ''
  };

  console.log(JSON.stringify(summary, null, 2));
}

run()
  .catch(async (error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (startedServer) {
      await stopServer();
    }
  });
