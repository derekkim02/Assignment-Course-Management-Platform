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

export async function populateSampleDatabase(prisma: PrismaClient) {
  await resetForTests(prisma);
  // Create a term
  const term = await prisma.term.create({
    data: {
      year: 24,
      term: 3,
    },
  });
  // Create a lecturer
  const lecturer = await prisma.user.create({
    data: {
      zid: 1234567,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'LECTURER',
      password: 'password123',
    },
  });

  // Create a course
  const course = await prisma.course.create({
    data: {
      id: 1,
      name: 'Computer Science Project',
      code: 'COMP3900',
      description: 'Capstone Project',
    },
  });

  // Assign the lecturer to the course
  await prisma.teachingAssignment.create({
    data: {
      lecturerId: lecturer.zid,
      courseId: course.id,
      termYear: term.year,
      termTerm: term.term,
    },
  });
}