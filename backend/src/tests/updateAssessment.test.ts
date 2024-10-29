import {describe, expect, beforeAll, afterEach, afterAll} from '@jest/globals';
import prisma from '../prismaClient';
import { createAssessment, updateAssessment } from '../assessments';
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

describe('updateAssessment', () => {
  it('should update an assessment that exists', async () => {
    await populateSampleDatabase(prisma);

    // Call the createAssessment function
    const newAssessment = await createAssessment(
      1234567,
      'Assignment 1',
      'Description of Assignment 1',
      '11/10/2024',
      false,
      '24T3',
      '1'
    );

    // Verify that the assessment exists in the database.
    expect(newAssessment).toBeDefined();

    // Call the updateAssessment function
    const updatedAssessment = await updateAssessment(
      1234567,
      newAssessment.id.toString(),
      'Assignment 2',
      'Description of Assignment 2',
      '12/10/2024',
      true,
      '24T3',
      '1'
    );

    expect(updatedAssessment).toBeDefined();
    expect(updatedAssessment.name).toBe('Assignment 2');
    expect(updatedAssessment.description).toBe('Description of Assignment 2');

  });
  it('should throw an error when an assessment does not exist', async () => {
    await populateSampleDatabase(prisma);

    // DO NOT Call the createAssessment function


    // Call the updateAssessment function
    await expect( updateAssessment(
      1234567,
      "1",
      'Assignment 2',
      'Description of Assignment 2',
      '12/10/2024',
      false,
      '24T3',
      '1'
    )).rejects.toThrow('Assignment not found');

  });
});