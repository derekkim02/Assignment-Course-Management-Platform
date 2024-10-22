import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const homepage = async (req: Request, res: Response): Promise<void> => {
	res.json({ user: { name: 'John Doe' } });
}

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
	const { assignmentId } = req.params;
	const { filePath } = req.body;
	const userEmail = req.userEmail;

	try {
		const zid = await prisma.user.findFirst({
			where: { email: userEmail },
			select: { zid: true },
		});

		if (!zid) {
			res.status(404).json({ error: 'You are not on the system' });
			return;
		}

		const offeringId = await prisma.assignment.findFirst({
			where: { id: parseInt(assignmentId) },
			select: { offeringId: true },
		});

		if (!assignment) {
			res.status(404).json({ error: 'Assignment not found' });
			return;
		}
		

		if (!assignment) {
			res.status(404).json({ error: 'Assignment not found' });
			return;
		}

		const submissionTime = new Date();
		const timeDiff = new Date(assignment.dueDate).getTime() - submissionTime.getTime();
		const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));

		let latePenalty = 0;
		if (daysLate > 0) {
			latePenalty = Math.min(daysLate * 5, 25);
		}


		const submission = await prisma.submission.create({
			data: {
				groupId: group.id,
				filePath,
				latePenalty,
				submissionTime,
			},
		});

	} catch {
		res.status(500).json({ error: 'Failed to submit assignment' });
	}
}

export const viewMarks = async (req: Request, res: Response): Promise<void> => {
	res.json({ assignment: { title: 'Assignment 1' } });
}

export const viewAssignment = async (req: Request, res: Response): Promise<void> => {
	res.json({ assignments: [{ title: 'Assignment 1' }] });
}
