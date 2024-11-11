import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { isValid, parseISO } from 'date-fns';

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
      !courseId ||
      !defaultShCmd
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check that the due date is a valid date
    const parsedDate = parseISO(dueDate);
    if (!isValid(parsedDate)) {
      res.status(400).json({ error: 'Invalid due date' });
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
        id: parseInt(courseId, 10),
        lecturerId: lecturer.zid,
      }
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

export const validateLecturerPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lecturerEmail = req.userEmail;
    const assignmentId = parseInt(req.params.assignmentId);

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

    const lecturer = await prisma.user.findUnique({
      where: {
        email: lecturerEmail,
      },
    });

    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    if (assignment.courseOffering.lecturerId !== lecturer.zid) {
      throw new Error("Lecturer does not have permission to access this assignment");
    }

    next();
  } catch (error) {
    console.error('Permission Error:', error);
    res.status(403).json({ error: 'Permission error' });
  }
}