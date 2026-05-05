import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'designer-dev-secret-change-this',
  cookieName: process.env.COOKIE_NAME || 'designer_session',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@designer.store',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123456',
  adminFirstName: process.env.ADMIN_FIRST_NAME || 'Store',
  adminLastName: process.env.ADMIN_LAST_NAME || 'Admin',
  isProduction: process.env.NODE_ENV === 'production'
};
