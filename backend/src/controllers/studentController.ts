import { Request, Response } from 'express';
import { SubmissionType } from '@prisma/client';
import prisma from '../prismaClient';

export const homepage = async (req: Request, res: Response): Promise<void> => {
	res.json({ user: { name: 'John Doe' } });
}

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
	const { assignmentId } = req.params;
	const { filePath } = req.body;
	const userEmail = req.userEmail;

	try {
		const data = await prisma.assignment.findUnique({
			where: { id: parseInt(assignmentId) },
			select: {
				courseOffering: {
					select: {
						penaltyStrategy: true, 
						enrolledStudents: {
							where: {
								email: userEmail,
							},
						},
					},
				},
				isGroupAssignment: true,
			}
		})

		if (!data) {
			res.status(404).json({ error: 'Assignment not found' });
			return;
		}

		if (data.isGroupAssignment) {
			res.status(400).json({ error: 'Group assignment submission not supported' });
			return;
		}

		if (!data.courseOffering.enrolledStudents.length) {
			res.status(403).json({ error: 'You are not enrolled in this course' });
			return;
		}

		const studentId = data.courseOffering.enrolledStudents[0].zid;

		const submission = await prisma.submission.create({
			data: {
				assignmentId: parseInt(assignmentId),
				studentId,
				filePath,
				submissionType: SubmissionType.Individual,
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
