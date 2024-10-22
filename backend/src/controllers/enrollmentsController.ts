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

    const enrollment = await prisma.teachingAssignment.findFirst({
      where: {
        courseId: parseInt(courseId),
        termYear: parseInt(termYear),
        termTerm: termTerm as Trimester
      },
      include: {
        course: true,
        lecturer: true,
      }
    });

    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: parseInt(courseId),
        termYear: parseInt(termYear),
        termTerm: termTerm as Trimester
      },
      select: {
        id: true,
        name: true,
        description: true,
        dueDate: true,
      }
    });

    const response = {
      ...enrollment,
      assignments
    };

    res.json(response);
  } catch (e) {
    console.error('Error fetching enrollment:', e);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
}
