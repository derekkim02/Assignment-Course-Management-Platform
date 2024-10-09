import { PrismaClient } from '@prisma/client';
import { Assignment } from './types';

const prisma = new PrismaClient();

export async function createAssessment(lecturerId: string, assignmentName: string, description: string, dueDate: string, term: string, courseId: string) {

  // check that the lecturer is assigned to the course
  // check the teachingassignments table for the lecturerId and courseId
  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: {
      lecturerId: parseInt(lecturerId),
      courseId: parseInt(courseId)
    }
  });

  if (!teachingAssignment) {
    throw new Error("Permission error: You are not assigned to this course")
  }

  let assignmentId: number;
  assignmentId = Math.floor(Math.random() * 1000); // Random 4 digit assignment ID

  // Assume that term is given in the format '24T3'
  const termYear = term.slice(0, 2);
  const termTerm = term[3]

  const newAssignment = await prisma.assignment.create({
    data: (
      {
        id: assignmentId,
        name: assignmentName,
        description: description,
        dueDate: new Date(dueDate),
        termYear: parseInt(termYear, 10),
        termTerm: parseInt(termTerm, 10),
        courseId: parseInt(courseId),
        testCases: {
          create: []
        },
        groups: {
          create: []
        }
      }
    )
  });

  return newAssignment;
}