import { Trimester } from '@prisma/client';
import prisma from './prismaClient';
import { parse, isValid } from 'date-fns';


export async function createAssessment(lecturerId: string, assignmentName: string, description: string, dueDate: string, term: string, courseId: string) {

  // Check the that term is given in the format '24T3'
  if (term.length !== 4) {
    throw new Error("Invalid term")
  }

  const termYear = term.slice(0, 2);
  const termTrimester = term.slice(2) as Trimester;

  // Check that the term exists
  const termExists = await prisma.term.findFirst({
    where: {
      year: parseInt(termYear, 10),
      term: termTrimester
    }
  });

  if (!termExists) {
    throw new Error("Term does not exist");
  }

    // Check that the due date is a valid date
    const parsedDate = parse(dueDate, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      throw new Error("Invalid due date");
    }
  
    // Check that the course exists
    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(courseId)
      }
    });
  
    if (!course) {
      throw new Error("Course does not exist");
    }

  // Check that lecturererId is 7 characters long
  if (lecturerId.length !== 7) {
    throw new Error("Invalid lecturer ID")
  }

  // check that the lecturer exists in the database
  const lecturer = await prisma.user.findFirst({
    where: {
      zid: parseInt(lecturerId)
    }
  });

  if (!lecturer) {
    throw new Error("Lecturer not found")
  }

  // check that the lecturer is assigned to the course
  // check the teachingassignments table for the lecturerId and courseId
  // Later on we'll check using a token system. 
  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: {
      lecturerId: parseInt(lecturerId),
      courseId: parseInt(courseId),
      termYear: parseInt(termYear)
    }
  });

  if (!teachingAssignment) {
    throw new Error("Permission error: You are not assigned to this course")
  }

  const newAssignment = await prisma.assignment.create({
    data: (
      {
        name: assignmentName,
        description: description,
        dueDate: parsedDate,
        termYear: parseInt(termYear, 10),
        termTerm: termTrimester,
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

// Function for a lecturer to update an assignment. 
// THIS DOES NOT INCLUDE ADDING TEST CASES TO AN ASSIGNMENT
// TEST CASES WILL BE ADDED THROUGH ANOTHER FUNCTION
export async function updateAssessment(lecturerId: string, assignmentId: string, assignmentName: string, description: string, dueDate: string, courseId: string) {

    // Check that lecturererId is 7 characters long
    if (lecturerId.length !== 7) {
      throw new Error("Invalid lecturer ID")
    }
  
    // check that the lecturer exists in the database
    const lecturer = await prisma.user.findFirst({
      where: {
        zid: parseInt(lecturerId)
      }
    });
  
    if (!lecturer) {
      throw new Error("Lecturer not found")
    }
  
    // check that the lecturer is assigned to the course
    // check the teachingassignments table for the lecturerId and courseId
    // Later on we'll check using a token system. 
    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        lecturerId: parseInt(lecturerId),
        courseId: parseInt(courseId),
      }
    });
  
    if (!teachingAssignment) {
      throw new Error("Permission error: You are not assigned to this course")
    }

    // Check that the assignment exists
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: parseInt(assignmentId)
      }
    });
  
    if (!assignment) {
      throw new Error("Assignment not found")
    }
  
    // Check that the due date is a valid date
    const parsedDate = parse(dueDate, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      throw new Error("Invalid due date");
    }
  
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: parseInt(assignmentId)
      },
      data: {
        name: assignmentName,
        description: description,
        dueDate: parsedDate
      }
    });
  
    return updatedAssignment;
}

export async function submitAssignment(groupId: number, filePath: string) {

	// Check if the group exists
	const group = await prisma.group.findFirst({
		where: {
			id: groupId
		}
	});

	if (!group) {
		throw new Error("Group not found")
	}

	const submissionTime = new Date();

	const newSubmission = await prisma.submission.create({
		data: ({
			filePath: filePath,
			submissionTime: submissionTime,
			latePenalty: 0, // TO BE IMPLEMENTED, is this supposed to be the percentage removed?
			groupId: groupId,
		})
	})

	await prisma.$disconnect();

	return newSubmission;
}


// const readInterface = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// function promptFunc(prompt: string): Promise<string> {
//   return new Promise(resolve => readInterface.question(prompt, resolve));
// }

// async function main() {
//   await resetForTests(prisma);
//   await populateSampleDatabase(prisma);
//   console.log("Create a new assignment");
//   try {
//     const lecturerId = await promptFunc("Lecturer zID: ");
//     const assignmentName = await promptFunc("Assignment Name: ");
//     const description = await promptFunc("Description: ");
//     const dueDate = await promptFunc("Due Date (DD/MM/YYYY): ");
//     const term = await promptFunc("Term: ");
//     const courseId = await promptFunc("Course ID: ");

//     const newAssignment = await createAssessment(lecturerId, assignmentName, description, dueDate, term, courseId);
//     console.log(newAssignment);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     await resetForTests(prisma);
//     await prisma.$disconnect();
//     readInterface.close();
//   }
// }