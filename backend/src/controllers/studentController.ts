import { Request, Response } from 'express';
import { SubmissionType } from '@prisma/client';
import prisma from '../prismaClient';
import AutomarkService from '../services/automarkService';

export const homepage = async (req: Request, res: Response): Promise<void> => {
	res.json({ user: { name: 'John Doe' } });
}

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
		await prisma.submission.create({
			data: {
				assignmentId: parseInt(assignmentId),
				[submitterIdKey]: submitterId,
				filePath,
				submissionType: isGroupAssignment ? SubmissionType.Group : SubmissionType.Individual,
			},
		});

		const automarkService = new AutomarkService(testCases, shCmd, filePath);
		const results = await automarkService.runTests();
		
		const response = {
			results: results,
			total: results.length,
			passed: results.filter(result => result.passed).length,
			failed: results.filter(result => !result.passed).length,
		}

		res.status(200).json(response);
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
