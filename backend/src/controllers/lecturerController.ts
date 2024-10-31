import { Request, Response } from "express";
import { createAssessment, updateAssessment } from "../assessments";
import { createTestCase } from "../testCases";
import { getUserFromToken } from "../jwtUtils";
import prisma from '../prismaClient';

/**
 * Creates a new assignment.
 * @param {Request} req - The request object containing the assignment details in the body.
 * @param {Response} res - The response object used to send the created assignment or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const createAssignment =  async (req: Request, res: Response): Promise<void> => {
	const user = await getUserFromToken(req);
	const lecturerId = user.zid;
	const { title, description, dueDate, isGroupAssignment, term, courseID, defaultShCmd } = req.body;
	try {
	  const newAssignment = await createAssessment(lecturerId, title, description, dueDate, isGroupAssignment, term, courseID, defaultShCmd);
	  res.json(newAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

/**
 * Updates an existing assignment.
 * @param {Request} req - The request object containing the assignment ID in the params and the updated assignment details in the body.
 * @param {Response} res - The response object used to send the updated assignment or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
	const user = await getUserFromToken(req);
	const lecturerId = user.zid;
	const { assignmentId } = req.params
	const { title, description, dueDate, isGroupAssignment, term, courseID } = req.body;
	try {
	  const updatedAssignment = await updateAssessment(lecturerId, assignmentId, title, description, dueDate, isGroupAssignment, term, courseID);
	  res.json(updatedAssignment);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

/**
 * Creates a new test case for an assignment.
 * @param {Request} req - The request object containing the lecturer ID, assignment ID, input, and output in the body.
 * @param {Response} res - The response object used to send the created test case or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const createTest = async (req: Request, res: Response): Promise<void> => {
	const { lecturerId, assignmentId, input, output } = req.body;
	try {
	  const newTestCase = await createTestCase(lecturerId, assignmentId, input, output);
	  res.json(newTestCase);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

/**
 * Retrieves a submission by its ID.
 * @param {Request} req - The request object containing the submission ID in the body.
 * @param {Response} res - The response object used to send the submission data or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
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

/**
 * Retrieves students enrolled in a specific course offering.
 * @param {Request} req - The request object containing the course ID, term year, and term term in the body.
 * @param {Response} res - The response object used to send the list of enrolled students or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 */
export const getStudentsInCourse =  async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, termYear, termTerm } = req.body;
    const courseOffering = await prisma.courseOffering.findUnique({
      where: {
        courseId_termYear_termTerm: {
          courseId: courseId,
          termYear: termYear,
          termTerm: termTerm,
        },
      },
      include: {
        enrolledStudents: true,
      },
    });

    if (!courseOffering) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(courseOffering.enrolledStudents);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

/**
 * Searches for a student by their ID.
 * @param {Request} req - The request object containing the student ID in the body.
 * @param {Response} res - The response object used to send the student data or an error message.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 */
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