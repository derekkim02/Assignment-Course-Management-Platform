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
	res.json({ assignment: { title: 'Assignment 1' } });
}

export const viewAssignment = async (req: Request, res: Response): Promise<void> => {
	res.json({ assignments: [{ title: 'Assignment 1' }] });
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