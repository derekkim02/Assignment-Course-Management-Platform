import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include assignmentData
declare module 'express-serve-static-core' {
  interface Request {
    assignmentData?: {
      assignmentName: string;
      description: string;
      dueDate: Date;
      isGroupAssignment: boolean;
      courseOfferingId: number;
      defaultShCmd: string;
      assignmentId?: number; // Include assignmentId when updating
    };
    userEmail?: string; // Assuming userEmail is added to req object by authentication middleware
  }
}

import { Trimester } from '@prisma/client';
import prisma from '../prismaClient';
import { isValid, parse } from 'date-fns';

export const validateAssignmentData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail = req.userEmail;
    const { courseId, assignmentId } = req.params;
    const {
      assignmentName,
      description,
      dueDate,
      isGroupAssignment,
      term,
      defaultShCmd,
    } = req.body;

    // Check if updating an existing assignment
    const isUpdating = !!assignmentId;

    // Validate required fields
    if (
      !userEmail ||
      !assignmentName ||
      !description ||
      !dueDate ||
      !term ||
      !courseId ||
      !defaultShCmd ||
      (isUpdating && !assignmentId)
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const termYear = term.slice(0, 2);
    const termTrimester = term.slice(2) as Trimester;

    // Check that the term exists
    const termExists = await prisma.term.findFirst({
      where: {
        year: parseInt(termYear, 10),
        term: termTrimester,
      },
    });

    if (!termExists) {
      res.status(400).json({ error: 'Term does not exist' });
      return;
    }

    // Check that the due date is a valid date
    const parsedDate = parse(dueDate, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      res.status(400).json({ error: 'Invalid due date' });
      return;
    }

    // Check that the course exists
    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(courseId),
      },
    });

    if (!course) {
      res.status(400).json({ error: 'Course does not exist' });
      return;
    }

    // Check that the lecturer exists
    const lecturer = await prisma.user.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (!lecturer) {
      res.status(400).json({ error: 'Lecturer not found' });
      return;
    }

    // Check that the lecturer is assigned to the course
    const teachingAssignment = await prisma.courseOffering.findFirst({
      where: {
        courseId: parseInt(courseId),
        termYear: parseInt(termYear),
        termTerm: termTrimester,
        lecturerId: lecturer.zid,
      },
    });

    if (!teachingAssignment) {
      res.status(403).json({ error: 'Permission error: You are not assigned to this course' });
      return;
    }

    // **New**: If updating, check that the assignment exists and belongs to the course
    if (isUpdating) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: parseInt(assignmentId),
          courseOfferingId: teachingAssignment.id,
        },
      });

      if (!assignment) {
        res.status(404).json({ error: 'Assignment not found or does not belong to this course' });
        return;
      }
    }

    // Attach validated data to req object
    req.assignmentData = {
      assignmentName,
      description,
      dueDate: parsedDate,
      isGroupAssignment,
      courseOfferingId: teachingAssignment.id,
      defaultShCmd,
      assignmentId: isUpdating ? parseInt(assignmentId) : undefined,
    };

    next();
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};