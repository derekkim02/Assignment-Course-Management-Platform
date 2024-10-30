import prisma from '../prismaClient';
import {describe, expect, beforeAll, afterEach, afterAll} from '@jest/globals';
import { createAssessment } from '../assessments';
import { downloadSubmissions } from '../downloadSubmissions';
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

describe('submitAssessment', () => {
  // it('should download all submissions when all attributes are valid', async () => {
  //   await populateSampleDatabase(prisma);

  //   // Create an assessment
  //   const newAssessment = await createAssessment(
  //     1234567,
  //     'Assignment 1',
  //     'Description of Assignment 1',
  //     '11/10/2024',
  //     false,
  //     '24T3',
  //     '1'
  //   );

  //   // Create a group
  //   const group = await prisma.group.create({
  //     data: {
  //       name: 'Group 1',
  //       size: 1,
  //       assignmentId: newAssessment.id,
  //     }
  //   });

  //   // Submit the assessment twice
  //   const submit1 = await submitAssignment(group.id, 'filePath');
  //   const submit2 = await submitAssignment(group.id, 'filePath');


  //   const submissions = await downloadSubmissions(group.id, newAssessment.id)
  //   // Verify the results
  //   expect(submit1.filePath).toBe('filePath');
  //   expect(submissions).toBeDefined();
  //   expect(submissions[0].submissionTime).toBe(submit2.submissionTime)
  //   expect(submissions[1].submissionTime).toBe(submit1.submissionTime)
  //   expect(submissions[1].groupId).toBe(group.id);
  // });

  it('should throw an error when the group does not exist', async () => {
    await populateSampleDatabase(prisma);

    // // Assign the lecturer to the course
    // await prisma.teachingAssignment.create({
    //   data: {
    //     lecturerId: lecturer.zid,
    //     courseId: course.id,
    //     termYear: term.year,
    //     termTerm: term.term,
    //   },
    // });

    // Create an assessment
    const newAssessment = await createAssessment(
      1234567,
      'Assignment 1',
      'Description of Assignment 1',
      '11/10/2024',
      false,
      '24T3',
      '1'
    );

    // Do not create a group

    // Call the createAssessment function
    await expect (downloadSubmissions(5, newAssessment.id)
  ).rejects.toThrow("Group not found");
  });
});