import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const submissions = await prisma.submission.findMany({
        where: {
          groupId: groupId,
          group: {
            assignment: {
              id: assignmentId,
            },
          },
        },
        include: {
          group: true, // Include the group details if needed
          mark: true,  // Include the mark details if needed
        }, orderBy: {
            submissionTime: 'desc'
        }
      });

      return submissions;

    // const submissions = await prisma.submission.findMany({
	// 	where: {
    //         groupId: groupId
    //     }, orderBy: {
    //         submissionTime: 'desc'
    //     }
	// });
}