import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const viewTutoredCourses = async (req: Request, res: Response): Promise<void> => {
	try {
		const data = await prisma.user.findUnique({
			where: {
				email: req.userEmail
			},
			include: {
				coursesTutored: {
					include: {
						course: true,
						term: true,
					}
				}
			}
		});

		if (!data) {
			res.status(404).json({ error: 'User\'s data does not exist' });
			return;
		}

		const response = data.coursesTutored.map(enrolment => ({
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

export const viewTutoredCourseDetails = async (req: Request, res: Response): Promise<void> => {
	try {
		const courseEnrollmentId = parseInt(req.params.courseId);
		const data = await prisma.courseOffering.findUnique({
			where: {
				id: courseEnrollmentId,
				tutors: {
					some: {
						email: req.userEmail
					}
				}
			},
			include: {
				term: true,
				course: true,
				assignments: true,
				enrolledStudents: true,
			}
		});

		if (!data) {
			res.status(404).json({ error: 'Course not found or you are not the tutor for this course' });
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
				assignmentDescription: assignment.description,
				dueDate: assignment.dueDate,
				isGroupAssignment: assignment.isGroupAssignment,
				defaultShCmd: assignment.defaultShCmd,
			})),
			enrolledStudents: data.enrolledStudents.map(student => ({
				zid: student.zid,
				firstName: student.firstName,
				lastName: student.lastName,
				email: student.email,
			})),
		};

		res.status(200).json(response);
	} catch {
		res.status(500).json({ error: 'Failed to fetch course details' });
	}
}

export const viewAssignmentDetails = async (req: Request, res: Response): Promise<void> => {
	try {
		const assignmentId = parseInt(req.params.assignmentId);
		const data = await prisma.assignment.findUnique({
			where: {
				id: assignmentId,
				courseOffering: {
					tutors: {
						some: {
							email: req.userEmail
						}
					}
				}
			}
		});

		if (!data) {
			res.status(404).json({ error: 'Assignment not found or you are not the tutor for this course' });
			return;
		}

		const response = {
			assignmentId: data.id,
			assignmentName: data.name,
			assignmentDescription: data.description,
			dueDate: data.dueDate,
			isGroupAssignment: data.isGroupAssignment,
			defaultShCmd: data.defaultShCmd,
		};

		res.status(200).json(response);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Failed to fetch assignment details' });
	}
}

export const viewAllSubmissions = async (req: Request, res: Response): Promise<void> => {
	try {
		const assignmentId = parseInt(req.params.assignmentId);
		const submissions = await prisma.submission.findMany({
			where: {
				assignment: {
					id: assignmentId,
					courseOffering: {
						tutors: {
							some: {
								email: req.userEmail
							}
						}
					}
				},
			}
		});

		if (!submissions) {
			res.status(404).json({ error: 'There are no submissions for this assignment or you are not a tutor for this assignment' });
			return;
		}

		const response = submissions.map(submission => ({
			id: submission.id,
			studentId: submission.studentId,
			groupId: submission.groupId,
			submissionTime: submission.submissionTime,
			submissionType: submission.submissionType,
			isMarked: submission.isMarked,
			automark: submission.autoMarkResult,
			stylemark: submission.styleMarkResult,
			finalMark: submission.finalMark,
			comments: submission.markerComments,
			latePenalty: submission.latePenalty,
		}));

		res.status(200).json(response);
	} catch {
		res.status(500).json({ error: 'Failed to fetch submissions' });
	}
}