// import { PrismaClient } from '@prisma/client';
// import { resetDatabase } from './utils';
// import { submitAssignment } from '../assessments';

// export const prisma = new PrismaClient();

// beforeAll(async () => {
//   await resetDatabase();
// });

// afterEach(async () => {
//   await resetDatabase();
// });

// afterAll(async () => {
//   // Disconnect Prisma client after all tests
//   await prisma.$disconnect();
// });

// describe('submitAssessment', () => {
//   it('should submit the assessment when all attributes are valid', async () => {
//     // Create a term
//     const term = await prisma.term.create({
//       data: {
//         year: 24,
//         term: "T3",
//       },
//     });

//     // Create a lecturer
//     const lecturer = await prisma.user.create({
//       data: {
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john.doe@example.com',
//         password: 'password123',
//       },
//     });

//     // Create a course
//     const course = await prisma.course.create({
//       data: {
//         name: 'Computer Science Project',
//         code: 'COMP3900',
//         description: 'Capstone Project',
//       },
//     });

//     // Assign the lecturer to the course
//     await prisma.teachingAssignment.create({
//       data: {
//         lecturerId: lecturer.zid,
//         courseId: course.id,
//         termYear: term.year,
//         termTerm: term.term,
//       },
//     });

//     // Create an assessment
//     const newAssessment = await prisma.assignment.create({
//       data: {
//         id: 0,
//         name: 'Assignment 1',
//         description: 'Description of Assignment 1',
//         dueDate: '2024-12-01T23:59:59.000Z',
//         termYear: 24,
//         termTerm: "T3",
//         courseId: course.id
//       }
//     });

//     // Create a group
//     const group = await prisma.group.create({
//       data: {
//         name: 'Group 1',
//         size: 1,
//         assignmentId: newAssessment.id,
//       }
//     });

//     // Submit the assessment
//     const submit = await submitAssignment(group.id, 'filePath');

//     // Verify the results
//     expect(submit.filePath).toBe('filePath');
//     expect(submit).toBeDefined();
//     expect(submit.groupId).toBe(group.id);
//   });

//   it('should throw an error when the group does not exist', async () => {
//     // Create a term
//     const term = await prisma.term.create({
//       data: {
//         year: 24,
//         term: "T3",
//       },
//     });

//     // Create a lecturer
//     const lecturer = await prisma.user.create({
//       data: {
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john.doe@example.com',
//         password: 'password123',
//       },
//     });

//     // Create a student
//     const student = await prisma.user.create({
//         data: {
//           firstName: 'Jane',
//           lastName: 'Garcy',
//           email: 'jane.garcy@example.com',
//           password: 'pasasword123',
//         },
//       });

//     // Create a course
//     const course = await prisma.course.create({
//       data: {
//         name: 'Computer Science Project',
//         code: 'COMP3900',
//         description: 'Capstone Project',
//       },
//     });

//     // Assign the lecturer to the course
//     await prisma.teachingAssignment.create({
//       data: {
//         lecturerId: lecturer.zid,
//         courseId: course.id,
//         termYear: term.year,
//         termTerm: term.term,
//       },
//     });

//     // Create an assessment
//     await prisma.assignment.create({
//       data: {
//         id: 0,
//         name: 'Assignment 1',
//         description: 'Description of Assignment 1',
//         dueDate: '2024-12-01T23:59:59.000Z',
//         termYear: 2024,
//         termTerm: "T3",
//         courseId: course.id
//       }
//     });

//     // Do not create a group

//     // Call the createAssessment function
//     await expect (submitAssignment(5, 'filePath')
//   ).rejects.toThrow("Group not found");
//   });
// });