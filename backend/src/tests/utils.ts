import { PrismaClient } from '@prisma/client';

export async function resetForTests(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.teachingAssignment.deleteMany({}),
    prisma.assignment.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.term.deleteMany({}),
  ]);
}