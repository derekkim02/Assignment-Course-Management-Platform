import { Request, Response } from 'express';
import { SubmissionType } from '@prisma/client';
import prisma from '../prismaClient';
import AutotestService from '../services/autotestService';

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
	return handleAssignmentSubmission(req, res, false);
}

export const submitGroupAssignment = async (req: Request, res: Response): Promise<void> => {
	return handleAssignmentSubmission(req, res, true);
}

const handleAssignmentSubmission = async (req: Request, res: Response, isGroupAssignment: boolean): Promise<void> => {
	try {
		const { assignmentId } = req.params;

		if (!req.file) {
			res.status(400).json({ error: 'No file uploaded' });
			return;
		}

		if (!req.submissionInfo) {
			res.status(500).json({ error: 'Missing submission information' });
			return;
		}

		const { submitterId, shCmd, testCases } = req.submissionInfo;
		const submitterIdKey = isGroupAssignment ? 'groupId' : 'studentId';

		const filePath = req.file.path;
		const submission = await prisma.submission.create({
			data: {
				assignmentId: parseInt(assignmentId),
				[submitterIdKey]: submitterId,
				filePath,
				submissionType: isGroupAssignment ? SubmissionType.Group : SubmissionType.Individual,
			},
		});

		const automarkService = new AutotestService(testCases, shCmd, filePath);
		const results = await automarkService.runTests();

		const response = {
			submissionId: submission.id,
			results: results,
			total: results.length,
			passed: results.filter(result => result.passed).length,
			failed: results.filter(result => !result.passed).length,
		}

		res.status(201).json(response);
	} catch (e) {
		res.status(500).json({ error: (e as Error).message });
	}
}

export const viewMarks = async (req: Request, res: Response): Promise<void> => {
	try {
		const data = await prisma.user.findUnique({
			where: {
				email: req.userEmail
			},
			include: {
				submissions: {
					include: {
						assignment: true,
					}
				},
				groups: {
					include: {
						submissions: {
							include: {
								assignment: true,
							}
						}
					}
				},
				coursesEnrolled: {
					include: {
						course: true,
						term: true,
						assignments: true,
					}
				}
			}
		});
		if (!data) {
			res.status(404).json({ error: 'User\'s data does not exist' });
			return;
		}

		const assignments = data.coursesEnrolled.flatMap(enrolment => 
			enrolment.assignments.map(assignment => ({
				id: assignment.id,
				name: assignment.name,
				isGroupAssignment: assignment.isGroupAssignment,
				term: enrolment.term.term,
				year: enrolment.term.year,
			}))
		);

		const marks = assignments.map(assignment => {
			const submission = () => {
				try {
					return data.submissions
						.filter(submission => submission.assignmentId === assignment.id)
						.reduce((prev, current) => (prev.submissionTime > current.submissionTime) ? prev : current);
				} catch {
					return null;
				}
			}
			const groupSubmission = () => {
				try {
					return data.groups
						.flatMap(group => group.submissions)
						.filter(submission => submission.assignmentId === assignment.id)
						.reduce((prev, current) => (prev.submissionTime > current.submissionTime) ? prev : current);
				} catch {
					return null;
				}
			}

			const latestSubmission = assignment.isGroupAssignment ? groupSubmission() : submission();

			return {
				assignmentId: assignment.id,
				assignmentName: assignment.name,
				term: assignment.term,
				year: assignment.year,
				isMarked: latestSubmission ? latestSubmission.isMarked : null,
				autoMark: latestSubmission ? latestSubmission.autoMarkResult : null,
				styleMark:  latestSubmission ? latestSubmission.styleMarkResult : null,
				latePenalty: latestSubmission ? latestSubmission.latePenalty : null,
				finalMark: latestSubmission ? latestSubmission.finalMark: null,
				markerComments: latestSubmission ? latestSubmission.markerComments : null,
			}
		});

		res.status(200).json(marks);
	} catch {
		res.status(500).json({ error: 'Failed to fetch marks' });
	}
}

export const viewAssignment = async (req: Request, res: Response): Promise<void> => {
	const { assignmentId } = req.params;

	const user = await prisma.user.findUnique({
		where: {
			email: req.userEmail
		}
	})

	try {
		const assignment = await prisma.assignment.findUnique({
			where: {
				id: parseInt(assignmentId),
				courseOffering: {
					enrolledStudents: {
						some: {
							email: req.userEmail,
						}
					}
				},
			},
			include: {
				submissions: {
					where: {
						studentId: user?.zid,
					}
				}

			}
		});

		if (!assignment) {
			res.status(404).json({ error: 'Assignment not found or you are not enrolled in the course.' });
			return;
		}

		res.status(200).json({
			assignmentName: assignment.name,
			description: assignment.description,
			dueDate: assignment.dueDate,
			isGroupAssignment: assignment.isGroupAssignment,
			submissions: assignment.submissions
		});
	} catch {
		res.status(500).json({ error: 'Failed to fetch assignment' });
	}
}

export const viewCourseEnrollments = async (req: Request, res: Response): Promise<void> => {
	try {
		const data = await prisma.user.findUnique({
			where: {
				email: req.userEmail
			},
			include: {
				coursesEnrolled: {
					include: {
						course: true,
						term: true,
					}
				}
			}
		})

		if (!data) {
			res.status(404).json({ error: 'User\'s data does not exist' });
			return;
		}

		const response = data.coursesEnrolled.map(enrolment => ({
			enrolmentId: enrolment.id,
			courseName: enrolment.course.name,
			courseCode: enrolment.course.code,
			courseDescription: enrolment.course.description,
			term: enrolment.term.term,
			year: enrolment.term.year,
		}));

		res.status(200).json(response);
	} catch {
		res.status(500).json({ error: 'Failed to fetch courses' });
	}
}

export const viewCourseEnrollmentDetails = async (req: Request, res: Response): Promise<void> => {
	try {
		const courseEnrollmentId = parseInt(req.params.courseId);
		const data = await prisma.courseOffering.findUnique({
			where: {
				id: courseEnrollmentId,
				enrolledStudents: {
					some: {
						email: req.userEmail
					}
				}
			},
			include: {
				term: true,
				course: true,
				assignments: true,
			}
		});

		if (!data) {
			res.status(404).json({ error: 'Course not found or you are not enrolled in this course' });
			return;
		}

		const response = {
			enrollmentId: data.id,
			courseName: data.course.name,
			courseCode: data.course.code,
			courseDescription: data.course.description,
			term: data.term.term,
			year: data.term.year,
			assignments: data.assignments.map(assignment => ({
				assignmentId: assignment.id,
				assignmentName: assignment.name,
				description: assignment.description,
				dueDate: assignment.dueDate,
				isGroupAssignment: assignment.isGroupAssignment,
				defaultShCmd: assignment.defaultShCmd,
			})),
		}

		res.status(200).json(response);
	} catch {
		res.status(500).json({ error: 'Failed to fetch courses' });
	}
}

export const downloadSubmission = async (req: Request, res: Response): Promise<void> => {
	try {
		const { submissionId } = req.params;
		const submission = await prisma.submission.findFirst({
			where: {
				id: parseInt(submissionId),
				OR: [
					{ student: { email: req.userEmail }},
					{ group: { members: { some: { email: req.userEmail }}}},
				],
			},
		});

		if (!submission) {
			res.status(404).json({ error: 'Submission not found or you do not have permission' });
			return;
		}

		res.status(200).download(submission.filePath);
	} catch {
		res.status(500).json({ error: 'Failed to download submission' });
	}
}

export const viewAssignments = async (req: Request, res: Response): Promise<void> => {
	try {
		const data = await prisma.user.findUnique({
			where: {
				email: req.userEmail
			},
			include: {
				coursesEnrolled: {
					include: {
						assignments: true,
					}
				},
				submissions: true,
				groups: {
					include: {
						submissions: true,
					}
				}
			}
		})

		if (!data) {
			res.status(404).json({ error: 'User\'s data does not exist' });
			return;
		}

		const response = data.coursesEnrolled.flatMap(enrolment => 
			enrolment.assignments.map(assignment => {
				const madeSubmission = data.submissions.some(submission => submission.assignmentId === assignment.id);
				const groupSubmission = data.groups
					.flatMap(group => group.submissions)
					.some(submission => submission.assignmentId === assignment.id);

				return {
					assignmentId: assignment.id,
					assignmentName: assignment.name,
					dueDate: assignment.dueDate,
					isGroupAssignment: assignment.isGroupAssignment,
					isSubmitted: madeSubmission || groupSubmission,
				}
			}
		));

		res.status(200).json(response);
	} catch (e) {
		res.status(500).json({ error: (e as Error).message });
	}
}