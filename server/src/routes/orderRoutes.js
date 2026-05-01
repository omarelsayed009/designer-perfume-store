import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, createHttpError } from '../lib/errors.js';
import { serializeOrder } from '../lib/serializers.js';
import { requireAuth } from '../middleware/auth.js';
import { validateOrderPayload } from '../lib/validation.js';

const router = express.Router();

function makeOrderReference() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${Date.now()}-${suffix}`;
}

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    orders: orders.map(serializeOrder)
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const payload = validateOrderPayload(req.body);
  const productIds = payload.items.map((item) => item.id);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    }
  });

  if (products.length !== productIds.length) {
    throw createHttpError(400, 'One or more products are no longer available');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const total = payload.items.reduce((sum, item) => {
    const product = productMap.get(item.id);
    return sum + product.price * item.qty;
  }, 0);

  const order = await prisma.order.create({
    data: {
      reference: makeOrderReference(),
      userId: req.user?.id || null,
      customerName: payload.customer.fullName,
      email: payload.customer.email,
      phone: payload.customer.phone,
      whatsapp: payload.customer.whatsapp,
      city: payload.customer.city,
      address: payload.customer.address,
      notes: payload.customer.notes || null,
      paymentMethod: payload.payment.method,
      paymentLabel: payload.payment.label,
      paymentDetail: payload.payment.detail || null,
      total: Number(total.toFixed(2)),
      items: {
        create: payload.items.map((item) => {
          const product = productMap.get(item.id);
          return {
            productId: product.id,
            qty: item.qty,
            price: product.price,
            titleSnapshot: product.title,
            descriptionSnapshot: product.description,
            thumbnailSnapshot: product.thumbnail,
            genderSnapshot: product.gender,
            ratingSnapshot: product.rating,
            stockSnapshot: product.stock
          };
        })
      }
    },
    include: { items: true }
  });

  res.status(201).json({
    message: req.user ? 'Order placed and saved' : 'Order placed successfully',
    order: serializeOrder(order),
    signedIn: Boolean(req.user),
    status: req.user
      ? `${payload.customer.fullName}, your order is saved in your account history with ${payload.payment.label}.`
      : `${payload.customer.fullName}, your order has been saved with ${payload.payment.label}.`
  });
}));

export default router;
