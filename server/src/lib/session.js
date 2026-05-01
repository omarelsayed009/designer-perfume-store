import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export function signSessionToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function verifySessionToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function setSessionCookie(res, user) {
  res.cookie(config.cookieName, signSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: COOKIE_MAX_AGE
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction
  });
}
