import { PrismaClient, Trimester } from '@prisma/client';
import { exec } from 'child_process';

export function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec('npx prisma migrate reset --force --skip-seed', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error resetting database: ${stderr}`);
        reject(error);
      } else {
        console.log(`Database reset: ${stdout}`);
        resolve();
      }
    });
  });
}

export async function populateSampleDatabase(prisma: PrismaClient) {
  //await resetDatabase();
  // Create a term
  const term = await prisma.term.create({
    data: {
      year: 24,
      term: "T3" as Trimester,
    },
  });
  // Create a lecturer
  const lecturer = await prisma.user.create({
    data: {
      zid: 1234567,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      isAdmin: true,
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
  await prisma.courseOffering.create({
    data: {
      courseId: course.id,
      termYear: term.year,
      termTerm: term.term,
      lecturerId: lecturer.zid
    },
  });

  await prisma.assignment.create({
    data: {
      id: 1,
      name: 'Assignment 1',
      description: 'Description of ass1',
      dueDate: new Date,
      isGroupAssignment: false,
      autoTestExecutable: null,
      courseOfferingId: 1,
    },
  });

  await prisma.group.create({
    data: {
      id: 1,
      name: 'Group 1',
      size: 1,
    },
  });
}