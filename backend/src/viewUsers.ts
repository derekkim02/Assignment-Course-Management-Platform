import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log('Users:', users);

  // Add more queries as needed to view other models
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });