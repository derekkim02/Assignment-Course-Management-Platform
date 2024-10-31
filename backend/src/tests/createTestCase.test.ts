import {describe, expect, beforeAll, afterEach, afterAll, it} from '@jest/globals';
import prisma from '../prismaClient';
import { createAssessment, updateAssessment } from '../assessments';
import { createTestCase } from '../testCases';
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

describe('createTestCase', () => {
  it('should create a test case for an assignment that exists', async () => {
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

    // Verify that the assessment exists in the database.
    expect(newAssessment).toBeDefined();

    // Call the updateAssessment function
    const testCase = await createTestCase(
      '1234567',
      newAssessment.id.toString(),
      'Input 1',
      'Output 1',
    )

    expect(testCase).toBeDefined();
    expect(testCase.input).toBe('Input 1');
    expect(testCase.expectedOutput).toBe('Output 1');

  });
  it('should throw an error when an assessment does not exist', async () => {
    await populateSampleDatabase(prisma);

    // DO NOT Call the createAssessment function


    // Call the updateAssessment function
    await expect( createTestCase(
      '1234567',
      '1',
      'Input 1',
      'Output 1',
    )).rejects.toThrow('Assignment not found');

  });
});