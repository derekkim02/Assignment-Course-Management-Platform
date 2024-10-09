import { PrismaClient } from '@prisma/client';
import { createAssessment } from '../assessments';
import { resetForTests } from './utils';

export const prisma = new PrismaClient();

beforeAll(async () => {
  await resetForTests(prisma);
});

afterEach(async () => {
  await resetForTests(prisma);
});

afterAll(async () => {
  // Disconnect Prisma client after all tests
  await prisma.$disconnect();
});

describe('createAssessment', () => {
  it('should create a new assessment when all attributes are valid', async () => {
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

    // Call the createAssessment function
    const newAssessment = await createAssessment(
      lecturer.zid.toString(),
      'Assignment 1',
      'Description of Assignment 1',
      '2024-12-01T23:59:59.000Z',
      '24T3',
      course.id.toString()
    );

    // Verify the results
    expect(newAssessment).toBeDefined();
    expect(newAssessment.name).toBe('Assignment 1');
    expect(newAssessment.description).toBe('Description of Assignment 1');
    expect(new Date(newAssessment.dueDate).toISOString()).toBe('2024-12-01T23:59:59.000Z');
    expect(newAssessment.termYear).toBe(24);
    expect(newAssessment.termTerm).toBe(3);
    expect(newAssessment.courseId).toBe(course.id);
  });

  it('should throw an error when the lecturer is not assigned to the course', async () => {
    // Create a term
    const term = await prisma.term.create({
      data: {
        year: 23,
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

    // DO NOT Assign the lecturer to the course

    // Call the createAssessment function
    await expect ( createAssessment(
      lecturer.zid.toString(),
      'Assignment 1',
      'Description of Assignment 1',
      '2024-12-01T23:59:59.000Z',
      '23T3',
      course.id.toString()
    )
  ).rejects.toThrow('Permission error: You are not assigned to this course');
  });
});