import { Request, Response } from "express";
import { createAssessment } from "../assessments";
import prisma from '../prismaClient';

export const createAssignment =  async (req: Request, res: Response): Promise<void> => {
	const {lecturerId, title, description, dueDate, term, courseID, } = req.body;
	try {
	  const newAssignment = await createAssessment(lecturerId, title, description, dueDate, term, courseID);
	  res.json(newAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

export const viewSubmission =  async (req: Request, res: Response): Promise<void> => {
	try {
    const { submissionId } = req.body;
	  const submission = await prisma.submission.findUnique({where: {id: parseInt(submissionId)}});

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
	  res.json(submission);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

export const getStudents =  async (res: Response): Promise<void> => {
	try {
	  const students = await prisma.user.findMany({
		where: {
		  isAdmin: false,
		},
	  });

    if (!students) {
      res.status(404).json({ error: 'Students table not found' });
      return;
    }
	  res.json(students);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

export const searchStudentById =  async (req: Request, res: Response): Promise<void> => {
	try {
    const { studentId } = req.body;
		const student = await prisma.user.findUnique({
		  where: {
			zid: studentId,
		  },
		});

	  if (!student) {
		res.status(404).json({ error: 'Student not found' });
		return;
	  }
		res.json(student);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
	}
}