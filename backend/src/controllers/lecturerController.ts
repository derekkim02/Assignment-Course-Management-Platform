import { Request, Response } from "express";
import { createAssessment } from "../assessments";

export const createAssignment =  async (req: Request, res: Response): Promise<void> => {
	const {lecturerId, title, description, dueDate, term, courseID, } = req.body;
	try {
	  const newAssignment = await createAssessment(lecturerId, title, description, dueDate, term, courseID);
	  res.json(newAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
  }