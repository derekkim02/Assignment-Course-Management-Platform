import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function main() {
  // POPULATING THE DATABASE

  // Create a term
  const term = await prisma.term.create({
    data: {
      year: 2024,
      term: 3,
    },
  });

  // Create a lecturer
  const lecturer = await prisma.user.create({
    data: {
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

  // Create an assessment
  const newAssessment = await prisma.assignment.create({
    data: {
      name: 'Assignment 1',
      description: 'Description of Assignment 1',
      dueDate: '2024-12-01T23:59:59.000Z',
      termYear: 2024,
      termTerm: 3,
      courseId: course.id
    }
  });

  // Create a group
  await prisma.group.create({
    data: {
      name: 'Group 1',
      size: 1,
      assignmentId: newAssessment.id,
    }
  });

  await prisma.$disconnect();
  console.log('Database Populated!');
}

main();