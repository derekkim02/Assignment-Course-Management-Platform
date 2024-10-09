import { PrismaClient } from '@prisma/client';

export async function submitAssignment(groupId: number, filePath: string) { // What if a group has two assignments?

    const prisma = new PrismaClient();

    const submissionTime = new Date();
    let submissionId = await generateSubmissionId();

    const newSubmission = await prisma.submission.create({
        data: (
            {
                id: submissionId,
                filePath: filePath,
                submissionTime: submissionTime,
                latePenalty: 0, // TO BE IMPLEMENTED, is this supposed to be the percentage removed?
                groupId: groupId,
            }
        )
    })

    await prisma.$disconnect();

    return newSubmission;
}

export async function resubmitAssignment(groupId: number, filePath: string) {

    const prisma = new PrismaClient();

    // remove from the database, then submit again
    try {
        await prisma.submission.delete({
            where: {
                groupId: groupId,
            },
        });
        // submit the assignment again
        submitAssignment(groupId, filePath)
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
}

// returns a number which is the size of the submission table + 1
async function generateSubmissionId() {

    const prisma = new PrismaClient();

    try {
        const id = await prisma.submission.count()
        return (id + 1);
    } catch(e) {
        throw e;
    } finally {
        await prisma.$disconnect()
    }
}