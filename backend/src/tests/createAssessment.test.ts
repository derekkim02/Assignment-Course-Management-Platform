import {describe, expect, beforeAll, afterEach, afterAll, it} from '@jest/globals';
import prisma from '../prismaClient';
import { createAssessment } from '../assessments';
import { resetDatabase, populateSampleDatabase } from './utils';


beforeAll(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  // Disconnect Prisma client after all tests
  await prisma.$disconnect();
});

describe('createAssessment', () => {
  it('should create a new assessment when all attributes are valid', async () => {
    await populateSampleDatabase(prisma);

    // Call the createAssessment function
    const newAssessment = await createAssessment(
      1234567,
      'Assignment 1',
      'Description of Assignment 1',
      '11/10/2024',
      false,
      '24T3',
      '1',
      'bash python3 main.py'
    );

    // Verify the results
    expect(newAssessment).toBeDefined();
    expect(newAssessment.name).toBe('Assignment 1');
    expect(newAssessment.description).toBe('Description of Assignment 1');
    //expect(new Date(newAssessment.dueDate).toISOString()).toBe('2024-11-10T13:00:00.000Z');
  });

  it('should throw an error when the lecturer is not assigned to the course', async () => {
    // Create a term
    const term = await prisma.term.create({
      data: {
        year: 23,
        term: "T3",
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

    // DO NOT Assign the lecturer to the course

    // Call the createAssessment function
    await expect ( createAssessment(
      lecturer.zid,
      'Assignment 1',
      'Description of Assignment 1',
      '11/10/2024',
      false,
      '23T3',
      course.id.toString(),
      'bash python3 main.py'
    )
  ).rejects.toThrow('Permission error: You are not assigned to this course');
  });
});