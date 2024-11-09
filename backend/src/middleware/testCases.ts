import prisma from '../prismaClient';
import { Request, Response, NextFunction } from 'express';

export const validateTestCaseData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lecturerEmail = req.userEmail;
    const assignmentId = parseInt(req.params.assignmentId);
    const { input, output, isHidden } = req.body;

    // Check that the assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        courseOffering: {
          select: {
            lecturerId: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Check that the lecturer is assigned to the courseOffering of the assignment
    const lecturer = await prisma.user.findUnique({
      where: {
        email: lecturerEmail,
      },
    });

    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    if (assignment.courseOffering.lecturerId !== lecturer.zid) {
      throw new Error("Lecturer does not have permission to create tests for this assignment");
    }

    // Sanitize and validate inputs
    if (!input || !output || typeof isHidden !== 'boolean') {
      throw new Error("Invalid input or outputs");
    }

    req.testData = {
      input,
      output,
      isHidden,
      assignmentId
    }

    next();
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}