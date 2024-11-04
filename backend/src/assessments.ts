import prisma from './prismaClient';
import { isValid, parseISO } from 'date-fns';

// function to check if provided values are valid
export async function validateAssessmentData(lecturerId: number, dueDate: string, courseOfferingId: number) {
  // Check that the courseOffering Exists.
  const courseOffering = await prisma.courseOffering.findFirst({
    where: {
      id: courseOfferingId
    }
  });

  if (!courseOffering) {
    throw new Error("Course Offering not found");
  }

  // Check that the due date is a valid date

  const parsedDate = parseISO(dueDate);
  if (!isValid(parsedDate)) {
    throw new Error("Invalid due date");
  }

  // Check that the lecturer exists in the database
  const lecturer = await prisma.user.findFirst({
    where: {
      zid: lecturerId
    }
  });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  // Check that the lecturer is assigned to the course
  const teachingAssignment = await prisma.courseOffering.findFirst({
    where: {
      id: courseOfferingId,
      lecturerId: lecturerId
    }
  });

  if (!teachingAssignment) {
    throw new Error("Permission error: You are not assigned to this course");
  }

  return {
    parsedDate
  };
}

export async function createAssessment(
  lecturerId: number,
  assignmentName: string,
  description: string,
  dueDate: string,
  isGroupAssignment: boolean,
  courseOfferingId: number,
  defaultShCmd: string
) {
  const { parsedDate } = await validateAssessmentData(lecturerId, dueDate, courseOfferingId);

  const newAssignment = await prisma.assignment.create({
    data: {
      name: assignmentName,
      description: description,
      dueDate: parsedDate,
      isGroupAssignment: isGroupAssignment,
      autoTestExecutable: '',
      courseOfferingId: courseOfferingId,
      defaultShCmd: defaultShCmd,
      submissions: {
        create: []
      },
      testCases: {
        create: []
      }
    }
  });

  return newAssignment;
}

export async function updateAssessment(lecturerId: number, assignmentId: string, assignmentName: string,
  description: string, dueDate: string, isGroupAssignment: boolean, courseOfferingId: number) {

  const { parsedDate } = await validateAssessmentData(lecturerId, dueDate, courseOfferingId);

  // Check that the assignment exists
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: parseInt(assignmentId)
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const updatedAssignment = await prisma.assignment.update({
    where: {
      id: parseInt(assignmentId)
    },
    data: {
      name: assignmentName,
      description: description,
      dueDate: parsedDate,
      isGroupAssignment: isGroupAssignment
    }
  });

  return updatedAssignment;
}

// rethink how permission/error checking is handled.
// just basic functions rn

// Returns assignment object from database
export async function getAssessment(assignmentId: string) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: parseInt(assignmentId)
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
}

// Deletes assignment from database
export async function deleteAssessment(assignmentId: string) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: parseInt(assignmentId)
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  await prisma.assignment.delete({
    where: {
      id: parseInt(assignmentId)
    }
  });

  return assignment;
}

// export async function submitAssignment(groupId: number, filePath: string) {

// 	// Check if the group exists
// 	const group = await prisma.group.findFirst({
// 		where: {
// 			id: groupId
// 		}
// 	});

// 	if (!group) {
// 		throw new Error("Group not found")
// 	}

// 	const submissionTime = new Date();

// 	const newSubmission = await prisma.submission.create({
// 		data: ({
// 			filePath: filePath,
// 			submissionTime: submissionTime,
// 			//latePenalty: 0, // TO BE IMPLEMENTED, is this supposed to be the percentage removed?
// 			groupId: groupId,
// 		})
// 	})

// 	await prisma.$disconnect();

// 	return newSubmission;
// }


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