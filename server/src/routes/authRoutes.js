import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, createHttpError } from '../lib/errors.js';
import { clearSessionCookie, setSessionCookie } from '../lib/session.js';
import { serializeUser } from '../lib/serializers.js';
import { validateLoginPayload, validateProfilePayload, validateSignupPayload } from '../lib/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', asyncHandler(async (req, res) => {
  res.json({
    user: serializeUser(req.user)
  });
}));

router.post('/signup', asyncHandler(async (req, res) => {
  const payload = validateSignupPayload(req.body);
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw createHttpError(409, 'This email already has an account');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      birthDate: payload.birthDate,
      gender: payload.gender,
      email: payload.email,
      passwordHash
    }
  });

  res.status(201).json({
    message: 'Account created successfully',
    user: serializeUser(user)
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const payload = validateLoginPayload(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (!user) {
    throw createHttpError(401, 'Wrong email or password');
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
  if (!passwordMatches) {
    throw createHttpError(401, 'Wrong email or password');
  }

  setSessionCookie(res, user);

  res.json({
    message: 'Logged in successfully',
    user: serializeUser(user)
  });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  clearSessionCookie(res);
  res.json({
    message: 'Logged out successfully'
  });
}));

router.patch('/profile', requireAuth, asyncHandler(async (req, res) => {
  const payload = validateProfilePayload(req.body);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      birthDate: payload.birthDate,
      gender: payload.gender,
      phone: payload.phone || null
    }
  });

  res.json({
    message: 'Profile updated',
    user: serializeUser(user)
  });
}));

export default router;
