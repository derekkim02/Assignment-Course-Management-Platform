import prisma from "./prismaClient";

// database will feature attributes for 1 sample input and multipple sample outputs
// export async function createTestCase(lecturerId: string, assignmentId: string, courseId: string, input: string, outputs: string[]) {
//   // add permission checks, sanitise inputs and all thhat
//     // Sanitize and validate inputs
//     if (!input || !Array.isArray(outputs) || outputs.length === 0) {
//       throw new Error("Invalid input or outputs");
//     }
  
//     // Create the test case
//     const testCase = await prisma.testCase.create({
//       data: {
//         filePath: '', // Assuming filePath is provided elsewhere or set to an empty string
//         input: input,
//         expectedOutputs: JSON.stringify(outputs), // Assuming outputs is a JSON field in the TestCase model
//         assignmentId: parseInt(assignmentId)
//       }
//     });
  
//     return testCase;

// }

export async function createTestCase(lecturerId: string, assignmentId: string, input: string, output: string) {
  // add permission checks, sanitise inputs and all thhat
  const lecturer = await prisma.user.findFirst({
    where: {
      zid: parseInt(lecturerId)
    }
  });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  // Check that the assignment exists
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: parseInt(assignmentId)
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }


  // Sanitize and validate inputs
  if (!input || !output) {
    throw new Error("Invalid input or outputs");
  }

  // Create the test case
  const testCase = await prisma.testCase.create({
    data: {
      input: input,
      expectedOutput: output,
      assignmentId: parseInt(assignmentId)
    }
  });

  return testCase;

}