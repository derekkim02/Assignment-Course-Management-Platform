import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');

    // Run a simple query
    const terms = await prisma.term.findMany();
    console.log('Terms:', terms);
  } catch (error) {
    console.error('Database connection failed', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
