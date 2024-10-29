import { Request, Response } from 'express';
import { getUserFromToken } from '../jwtUtils';
import { courseFetchStrategies } from '../utils';
import prisma from '../prismaClient';
import { Trimester } from '@prisma/client';

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
