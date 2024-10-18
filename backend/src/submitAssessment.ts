import { PrismaClient } from '@prisma/client';
import { submitAssignment } from './assessments';

const prisma = new PrismaClient();


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
