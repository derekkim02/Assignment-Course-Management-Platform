import { Request, Response } from 'express';
import { downloadSubmissions } from '../downloadSubmissions';


export const homepage = async (req: Request, res: Response): Promise<void> => {
	res.json({ user: { name: 'John Doe' } });
}

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
	res.json({ message: 'Assignment submitted' });
}

export const viewMarks = async (req: Request, res: Response): Promise<void> => {
	res.json({ assignment: { title: 'Assignment 1' } });
}

export const viewAssignment = async (req: Request, res: Response): Promise<void> => {
	res.json({ assignments: [{ title: 'Assignment 1' }] });
}

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
	const {groupId, submissionId } = req.body;
	try {
		const submissions = await downloadSubmissions(groupId, submissionId);
		res.json(submissions);
	} catch (error) {
		res.status(400).json({ error: (error as Error).message });
	}
}
