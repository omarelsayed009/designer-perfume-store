import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'designer-dev-secret-change-this',
  cookieName: process.env.COOKIE_NAME || 'designer_session',
  isProduction: process.env.NODE_ENV === 'production'
};
