import { PrismaClient } from '@prisma/client';
import { seedProducts } from '../server/src/data/catalog.js';

const prisma = new PrismaClient();

async function main() {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
