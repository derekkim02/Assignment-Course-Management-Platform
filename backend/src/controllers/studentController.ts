import { Request, Response } from 'express';


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
