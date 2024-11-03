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
				defaultShCmd: true,
				isGroupAssignment: true,
				testCases: {
					select: {
						input: true,
						expectedOutput: true,
						isHidden: true,
					},
				},
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
		req.submissionInfo = {
			submitterId: data.courseOffering.enrolledStudents[0].zid,
			shCmd: data.defaultShCmd,
			testCases: data.testCases.filter(t => t.isHidden === false),
		};
		next();
	} catch {
		res.status(500).json({ error: 'Internal server error' });
	}
}

export const validateGroupSubmission = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { assignmentId } = req.params;
	const userEmail = req.userEmail;
	const { groupId } = req.body;
	try {
		const assignment = await prisma.assignment.findUnique({
			where: { id: parseInt(assignmentId) },
			include: {
				courseOffering: {
					include: {
						enrolledStudents: {
							select: {
								zid: true
							}
						}
					}
				},
				testCases: {
					select: {
						input: true,
						expectedOutput: true
					}
				}
			}
		});
		if (!assignment) {
			res.status(404).json({ error: 'Assignment does not exist' });
			return;
		}

		const group = await prisma.group.findUnique({
			where: { id: parseInt(groupId) },
			include: {
				members: true
			}
		});
		if (!group) {
			res.status(404).json({ error: 'Group does not exist' });
			return;
		}

		if (!group.members.some(member => member.email === userEmail)) {
			res.status(403).json({ error: 'You are not a member of this group' });
			return;
		}

		const enrolledStudents = assignment.courseOffering.enrolledStudents.map(student => student.zid);
		const groupMembers = group.members.map(member => member.zid);

		if (!groupMembers.every(member => enrolledStudents.includes(member))) {
			res.status(403).json({ error: 'Group members are not all enrolled in this course' });
			return;
		}

		req.submissionInfo = {
			submitterId: group.id,
			shCmd: assignment.defaultShCmd,
			testCases: assignment.testCases
		};
		next();
	} catch {
		res.status(500).json({ error: 'Internal server error' });
	}
}