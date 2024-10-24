import { Request, Response } from "express";
import { createAssessment, updateAssessment } from "../assessments";

export const createAssignment =  async (req: Request, res: Response): Promise<void> => {
	const {lecturerId, title, description, dueDate, isGroupAssignment, term, courseID, } = req.body;
	try {
	  const newAssignment = await createAssessment(lecturerId, title, description, dueDate, isGroupAssignment, term, courseID);
	  res.json(newAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
  }

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
	const { lecturerId, assignmentId, title, description, dueDate, isGroupAssignment, term, courseID } = req.body;
	try {
	  const updatedAssignment = await updateAssessment(lecturerId, assignmentId, title, description, dueDate, isGroupAssignment, term, courseID);
	  res.json(updatedAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
	}