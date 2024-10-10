import { PrismaClient } from '@prisma/client';

export async function resetForTests(prisma: PrismaClient) {

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

  await prisma.$transaction([
    prisma.teachingAssignment.deleteMany({}),
    prisma.assignment.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.submission.deleteMany({}),
    prisma.group.deleteMany({}),
    prisma.term.deleteMany({}),
  ]);

  // Enable foreign key checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
}