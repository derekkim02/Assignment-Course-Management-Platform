import { Request, Response } from "express";
import { createAssessment, updateAssessment } from "../assessments";
import { createTestCase } from "../testCases";

export const createAssignment =  async (req: Request, res: Response): Promise<void> => {
	const { title, description, dueDate, isGroupAssignment, term, courseID } = req.body;
	try {
	  const newAssignment = await createAssessment(req, title, description, dueDate, isGroupAssignment, term, courseID);
	  res.json(newAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
  }

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
	const { assignmentId } = req.params
	const { title, description, dueDate, isGroupAssignment, term, courseID } = req.body;
	try {
	  const updatedAssignment = await updateAssessment(req, assignmentId, title, description, dueDate, isGroupAssignment, term, courseID);
	  res.json(updatedAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
	}

export const createTest = async (req: Request, res: Response): Promise<void> => {
	const { lecturerId, assignmentId, input, output } = req.body;
	try {
	  const newTestCase = await createTestCase(lecturerId, assignmentId, input, output);
	  res.json(newTestCase);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}