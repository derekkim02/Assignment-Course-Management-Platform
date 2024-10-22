import prisma from "./prismaClient";

// database will feature attributes for 1 sample input and multipple sample outputs
export async function createTestCase(lecturerId: string, assignmentId: string, courseId: string, input: string, outputs: string[]) {
  // add permission checks, sanitise inputs and all thhat
    // Sanitize and validate inputs
    if (!input || !Array.isArray(outputs) || outputs.length === 0) {
      throw new Error("Invalid input or outputs");
    }
  
    // Create the test case
    const testCase = await prisma.testCase.create({
      data: {
        filePath: '', // Assuming filePath is provided elsewhere or set to an empty string
        input: input,
        outputs: JSON.stringify(outputs), // Assuming outputs is a JSON field in the TestCase model
        assignmentId: parseInt(assignmentId)
      }
    });
  
    return testCase;

}