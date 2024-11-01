import { Request, Response } from 'express';
import { getUserFromToken } from '../middleware/jwt';
import { courseFetchStrategies } from '../utils';
import prisma from '../prismaClient';
import { Trimester } from '@prisma/client';

/**
 * Retrieves the list of courses a user is enrolled in based on their role.
 *
 * @param {Request} req - The request object containing the user's token and role.
 * @param {Response} res - The response object used to send back the list of courses.
 * @returns {Promise<void>} - A promise that resolves when the courses are fetched and sent in the response.
 *
 */
export const getEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserFromToken(req);
    const role = req.query.role as string;
    const courses = await courseFetchStrategies[role](user);

    res.json(courses);
  } catch (e) {
    console.error('Error fetching courses:', e);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

/**
 * Retrieves the details of a specific course offering based on course ID, term year, and term term.
 *
 * @param {Request} req - The request object containing the course ID, term year, and term term.
 * @param {Response} res - The response object used to send back the course offering details.
 * @returns {Promise<void>} - A promise that resolves when the course offering details are fetched and sent in the response.
 *
 */
export const getEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, termYear, termTerm } = req.params;

    const courseOffering = await prisma.courseOffering.findFirst({
      where: {
        courseId: parseInt(courseId),
        termYear: parseInt(termYear),
        termTerm: termTerm as Trimester
      },
      include: {
        course: true,
        lecturer: true,
        tutors: true,
        enrolledStudents: true,
        assignments: true,
      }
    });

    if (!courseOffering) {
      res.status(404).json({ error: 'Course offering not found' });
      return;
    }

    const response = {
      ...courseOffering,
      assignments: courseOffering.assignments.map(assignment => ({
        id: assignment.id,
        name: assignment.name,
        description: assignment.description,
        dueDate: assignment.dueDate,
        isGroupAssignment: assignment.isGroupAssignment,
      }))
    };

    res.json(response);
  } catch (e) {
    console.error('Error fetching course offering:', e);
    res.status(500).json({ error: 'Failed to fetch course offering' });
  }
}
