const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch {
    throw new ApiError('Backend is not running right now', 0, 'NETWORK_ERROR');
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.message || 'Request failed', response.status);
  }

  return data;
}

export function ping() {
  return request('/health', { method: 'GET' });
}

export function fetchProducts() {
  return request('/products', { method: 'GET' });
}

export function fetchSession() {
  return request('/auth/me', { method: 'GET' });
}

export function signup(payload) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST'
  });
}

export function updateProfile(payload) {
  return request('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function fetchFavorites() {
  return request('/favorites', { method: 'GET' });
}

export function addFavorite(productId) {
  return request(`/favorites/${productId}`, { method: 'PUT' });
}

export function removeFavorite(productId) {
  return request(`/favorites/${productId}`, { method: 'DELETE' });
}

export function fetchOrders() {
  return request('/orders/me', { method: 'GET' });
}

export function placeOrder(payload) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
