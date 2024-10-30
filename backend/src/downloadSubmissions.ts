import prisma from './prismaClient';
import { populateSampleDatabase, resetDatabase } from './tests/utils';
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
/**
 * Returns submission details of a given assignment and group
 * @param groupId number
 * @param assignmentId number
 * @returns Submissions of corresponding arguments from most recent submission
 */
export async function downloadSubmissions(groupId: number, assignmentId: number) {
    // Check if the group exists
    const group = await prisma.group.findFirst({
      where: {
        id: groupId
      }
    });

    if (!group) {
      throw new Error("Group not found")
	  }

    // Check if the assignment exists
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId
      }
    });

    if (!assignment) {
      throw new Error("Assignment not found")
    }

    const submissions = await prisma.submission.findMany({
        where: {
          groupId: groupId,
          assignmentId: assignmentId,
        },
        include: {
          group: true, // Include the group details if needed
          marks: true,  // Include the mark details if needed
        }, orderBy: {
            submissionTime: 'desc'
        }
      });

      if (submissions.length === 0) {
        return "No submissions found"
      }
      return submissions;
}

// async function test() {
//   populateSampleDatabase(prisma)
//   downloadSubmissions(1, 1);
//   resetDatabase();
// }

// test()