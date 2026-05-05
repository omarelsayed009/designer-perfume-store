import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { prisma } from './prisma.js';

export async function ensureAdminAccount() {
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);

  await prisma.user.upsert({
    where: { email: config.adminEmail },
    update: {
      firstName: config.adminFirstName,
      lastName: config.adminLastName,
      passwordHash,
      role: 'admin'
    },
    create: {
      email: config.adminEmail,
      firstName: config.adminFirstName,
      lastName: config.adminLastName,
      passwordHash,
      role: 'admin'
    }
  });
}
