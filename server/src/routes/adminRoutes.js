import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, createHttpError } from '../lib/errors.js';
import {
  serializeAdminCustomer,
  serializeAdminOrder,
  serializeProduct
} from '../lib/serializers.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const LOW_STOCK_THRESHOLD = 8;

router.use(requireAuth, requireAdmin);

router.get('/overview', asyncHandler(async (req, res) => {
  const [productCount, customerCount, orderSummaries, recentCustomers, lowStockProducts] = await prisma.$transaction([
    prisma.product.count(),
    prisma.user.count({
      where: { role: 'customer' }
    }),
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        total: true
      }
    }),
    prisma.user.findMany({
      where: { role: 'customer' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        _count: {
          select: {
            favorites: true,
            orders: true
          }
        }
      }
    }),
    prisma.product.findMany({
      where: {
        stock: { lte: LOW_STOCK_THRESHOLD }
      },
      orderBy: [
        { stock: 'asc' },
        { title: 'asc' }
      ],
      take: 6
    })
  ]);

  const revenue = orderSummaries
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingOrders = orderSummaries.filter((order) => order.status === 'pending').length;

  res.json({
    stats: {
      products: productCount,
      customers: customerCount,
      orders: orderSummaries.length,
      revenue: Number(revenue.toFixed(2)),
      pendingOrders,
      lowStockProducts: lowStockProducts.length
    },
    statusBreakdown: ORDER_STATUSES.map((status) => ({
      status,
      count: orderSummaries.filter((order) => order.status === status).length
    })),
    recentCustomers: recentCustomers.map(serializeAdminCustomer),
    lowStockProducts: lowStockProducts.map((product) => ({
      ...serializeProduct(product),
      updatedAt: product.updatedAt
    }))
  });
}));

router.get('/orders', asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    orders: orders.map(serializeAdminOrder)
  });
}));

router.get('/products', asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: [
      { stock: 'asc' },
      { bestSellerScore: 'desc' },
      { title: 'asc' }
    ]
  });

  res.json({
    products: products.map((product) => ({
      ...serializeProduct(product),
      updatedAt: product.updatedAt
    }))
  });
}));

router.patch('/orders/:orderId/status', asyncHandler(async (req, res) => {
  const orderId = String(req.params.orderId || '').trim();
  const status = String(req.body?.status || '').trim().toLowerCase();

  if (!orderId) {
    throw createHttpError(400, 'Invalid order id');
  }

  if (!ORDER_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid order status');
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!existingOrder) {
    throw createHttpError(404, 'Order not found');
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: true,
      user: true
    }
  });

  res.json({
    message: 'Order status updated',
    order: serializeAdminOrder(order)
  });
}));

export default router;
