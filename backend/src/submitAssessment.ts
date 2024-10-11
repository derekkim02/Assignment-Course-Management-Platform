import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function submitAssignment(groupId: number, filePath: string) {

	// Check if the group exists
	const group = await prisma.group.findFirst({
		where: {
			id: groupId
		}
	});

	if (!group) {
		throw new Error("Group not found")
	}

	const submissionTime = new Date();

	const newSubmission = await prisma.submission.create({
		data: ({
			filePath: filePath,
			submissionTime: submissionTime,
			latePenalty: 0, // TO BE IMPLEMENTED, is this supposed to be the percentage removed?
			groupId: groupId,
		})
	})

	await prisma.$disconnect();

	return newSubmission;
}

// Remember to run npx prisma migrate reset in the backend directory to reset the database
async function main() {

	// Grab a random group to use as group id for this demonstration, it is normally provided by the frontend
	const group = await prisma.group.findFirst({});
	if (group != null) {

		// Submit the assessment, group.id and filePath will be provided by the frontend
		await submitAssignment(group.id, 'filePath');

		// To test if the function worked, the submission should exist in the database, so we need to search for it.
		const submissions = await prisma.submission.findMany({
			where: {
				groupId: group.id
			}
		});

		// Multiple submissions should be allowed, which is accounted for.

		// Console.log the submission, which was retrieved from the database
		console.log('----- TEST SUBMIT ASSESSMENT IN DATABASE -----');
		console.log(submissions);
	} else {
		console.log('error: group not found');
	}

}

main();
