import { PrismaClient } from '@prisma/client';
import readline from 'readline';

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

  // Assume that term is given in the format '24T3'
  const termYear = term.slice(0, 2);
  const termTerm = term[3]

  const newAssignment = await prisma.assignment.create({
    data: (
      {
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

const readInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptFunc(prompt: string): Promise<string> {
  return new Promise(resolve => readInterface.question(prompt, resolve));
}

async function main() {
  console.log("Create a new assignment");
  try {
    const lecturerId = await promptFunc("Lecturer zID: ");
    const assignmentName = await promptFunc("Assignment Name: ");
    const description = await promptFunc("Description: ");
    const dueDate = await promptFunc("Due Date: ");
    const term = await promptFunc("Term: ");
    const courseId = await promptFunc("Course ID: ");

    const newAssignment = await createAssessment(lecturerId, assignmentName, description, dueDate, term, courseId);
    console.log(newAssignment);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    readInterface.close();
  }
}

main();