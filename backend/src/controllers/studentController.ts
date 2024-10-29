import { Request, Response } from 'express';
import { SubmissionType } from '@prisma/client';
import prisma from '../prismaClient';

export const homepage = async (req: Request, res: Response): Promise<void> => {
	res.json({ user: { name: 'John Doe' } });
}

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
	try {
		const { assignmentId } = req.params;
		const studentId = req.zid;
		
		if (!req.file) {
			res.status(400).json({ error: 'No file uploaded' });
			return;
		}

		const filePath = req.file.path;


		await prisma.submission.create({
			data: {
				assignmentId: parseInt(assignmentId),
				studentId,
				filePath,
				submissionType: SubmissionType.Individual,
			},
		});

		//TODO: fetch file

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
