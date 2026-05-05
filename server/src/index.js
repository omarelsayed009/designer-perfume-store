import { app } from './app.js';
import { config } from './config.js';
import { ensureAdminAccount } from './lib/ensureAdmin.js';
import { prisma } from './lib/prisma.js';

async function startServer() {
  await prisma.$connect();
  await ensureAdminAccount();

  app.listen(config.port, () => {
    console.log(`Designer API running on http://localhost:${config.port}`);
  });
}

startServer().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
