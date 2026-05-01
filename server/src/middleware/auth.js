import { prisma } from '../lib/prisma.js';
import { verifySessionToken } from '../lib/session.js';
import { config } from '../config.js';
import { createHttpError } from '../lib/errors.js';

export async function attachSession(req, res, next) {
  const token = req.cookies?.[config.cookieName];

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const payload = verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    next(createHttpError(401, 'Please sign in first'));
    return;
  }

  next();
}
