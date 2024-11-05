import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { Trimester } from '@prisma/client';
import CsvService from '../services/csvService';

export const changeAdminRole = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { isAdmin } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { zid: parseInt(userId) }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (isAdmin) {
      await prisma.user.update({
        where: {
          zid: parseInt(userId)
        },
        data: {
          isAdmin: true
        }
      });
    } else {
      const adminCount = await prisma.user.count({
        where: {
          isAdmin: true,
        },
      });
      if (adminCount === 1) {
        res.status(400).json({ error: 'Cannot demote the last admin user' });
        return;
      }
      await prisma.user.update({
        where: {
          zid: parseInt(userId)
        },
        data: {
          isAdmin: false
        }
      });
    }
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
}

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  function mapTermToTrimester(term: number): Trimester {
    switch (term) {
      case 0:
        return Trimester.T0;
      case 1:
        return Trimester.T1;
      case 2:
        return Trimester.T2;
      case 3:
        return Trimester.T3;
      default:
        return Trimester.T0;
    }
  }

  const { lecturerId, courseId, termYear, termTerm } = req.body;
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await prisma.term.upsert({
      where: {
        year_term: {
          year: termYear,
          term: mapTermToTrimester(termTerm)
        }
      },
      update: {},
      create: {
        year: termYear,
        term: mapTermToTrimester(termTerm)
      }
    });

    const offering = await prisma.courseOffering.create({
      data: {
        courseId,
        termYear,
        termTerm: mapTermToTrimester(termTerm),
        lecturerId,
      }
    });
    res.status(201).json(offering);
  } catch (error) {
    console.error('Error creating course offering:', error);
    res.status(500).json({ error: 'Failed to create course offering' });
  }
}


export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const { name, code, description } = req.body;
  try {
    const newCourse = await prisma.course.create({
      data: {
        name,
        code,
        description
      }
    });
    res.status(201).json(newCourse);
  } catch (e) {
    res.status(400).json({ error: `Failed to create course ${e}` });
  }
}

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

/**
 * Fetches all users from the database and returns them in the response.
 *
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 * @returns {Promise<void>} - A promise that resolves when the users are fetched and the response is sent.
 *
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: `Failed to fetch users (${e})` });
  }
}

export const getCourseOfferings = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseOfferings = await prisma.courseOffering.findMany(
      {
        include: {
          course: true,
          term: true,
          lecturer: true
        }
      }
    );

    const response = courseOfferings.map(enrolment => ({
      id: enrolment.id,
      courseCode: enrolment.course.code,
      courseName: enrolment.course.name,
      term: `${enrolment.term.year}${enrolment.term.term}`,
		}));


    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ error: `Failed to fetch users (${e})` });
  }
}

export const getCourseOffering = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseOffering = await prisma.courseOffering.findUnique(
      {
        where: {
          id: parseInt(req.params.courseOfferingId)
        },
        include: {
          course: true,
          term: true,
          lecturer: true,
          enrolledStudents: true,
          tutors: true
        }
      }
    );

    if (!courseOffering) {
      res.status(404).json({ error: 'Course offering not found' });
      return;
    }

    const response = {
      courseCode: courseOffering.course.code,
      courseName: courseOffering.course.name,
      term: `${courseOffering.term.year}${courseOffering.term.term}`,
      lecturer: courseOffering.lecturer,
      students: courseOffering.enrolledStudents,
      tutors: courseOffering.tutors
    }

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ error: `Failed to fetch users (${e})` });
  }
}

export const updateCourseOffering = async (req: Request, res: Response): Promise<void> => {
  const { lecturerId, tutorsIds, studentIds } = req.body;
  const { courseOfferingId } = req.params;

  try {
    await prisma.courseOffering.update({
      where: {
        id: parseInt(courseOfferingId)
      },
      data: {
        lecturerId,
        tutors: {
          set: tutorsIds.map((tutorId: number) => ({ zid: tutorId }))
        },
        enrolledStudents: {
          set: studentIds.map((studentId: number) => ({ zid: studentId }))
        }
      }
    });
    res.status(201).json({ message: 'Course offering updated successfully' });
  } catch (e) {
    res.status(500).json({ error: `Failed to update course offering (${e})` });
  }
}

export const importCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseOfferingId } = req.params;
  
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Parse the CSV file
    const csvService = new CsvService(req.file.path);
    await csvService.importSMSCsvToDbForCourseOffering(parseInt(courseOfferingId, 10));
    csvService.unlinkCsvFile();
    res.status(201).json({ message: 'CSV imported successfully' });
  } catch (e) {
    res.status(500).json({ error: `Failed to import CSV (${e})` });
  }
}