import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, createHttpError } from '../lib/errors.js';
import { serializeFavorite } from '../lib/serializers.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    favorites: favorites.map(serializeFavorite)
  });
}));

router.put('/:productId', asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createHttpError(400, 'Invalid product id');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  await prisma.favorite.upsert({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId
      }
    },
    update: {},
    create: {
      userId: req.user.id,
      productId
    }
  });

  res.json({
    message: 'Added to favorites',
    active: true
  });
}));

router.delete('/:productId', asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createHttpError(400, 'Invalid product id');
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: req.user.id,
      productId
    }
  });

  res.json({
    message: 'Removed from favorites',
    active: false
  });
}));

export default router;
