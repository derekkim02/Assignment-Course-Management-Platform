import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

export const validateSingleSubmission = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { assignmentId } = req.params;
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
			},
		});

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

		req.zid = data.courseOffering.enrolledStudents[0].zid;
		next();
	} catch {
		res.status(500).json({ error: 'Internal server error' });
	}
}