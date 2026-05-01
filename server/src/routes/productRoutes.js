import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, createHttpError } from '../lib/errors.js';
import { serializeProduct } from '../lib/serializers.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const gender = String(req.query.gender || '').trim();
  const search = String(req.query.search || '').trim().toLowerCase();
  const featuredLimit = Number(req.query.featuredLimit) || null;

  let products = await prisma.product.findMany({
    orderBy: [
      { bestSellerScore: 'desc' },
      { title: 'asc' }
    ]
  });

  if (gender && gender !== 'home') {
    products = products.filter((product) => product.gender === gender);
  }

  if (search) {
    products = products.filter((product) => product.title.toLowerCase().includes(search));
  }

  const serialized = products.map(serializeProduct);

  res.json({
    products: serialized,
    featured: featuredLimit ? serialized.slice(0, featuredLimit) : serialized
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createHttpError(400, 'Invalid product id');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  const recommendations = await prisma.product.findMany({
    where: {
      id: { not: productId },
      gender: product.gender
    },
    orderBy: [
      { bestSellerScore: 'desc' },
      { title: 'asc' }
    ],
    take: 4
  });

  res.json({
    product: serializeProduct(product),
    recommendations: recommendations.map(serializeProduct)
  });
}));

export default router;
