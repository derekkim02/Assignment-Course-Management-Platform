import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { validateAssignmentData, validateLecturerPermissions } from '../middleware/assignment';
import { uploadCsv } from '../middleware/multer';
import { importCsv } from '../controllers/adminController';
import { 
	createAssignment,
	searchStudentById,
	getStudentsInCourse,
	viewAllSubmissions,
	viewSubmission,
	createTest,
	updateAssignment,
	viewAssignment,
	deleteAssignment,
	viewLecturedCourses,
	viewLecturedCourseDetails,
	markAllSubmissions,
	downloadStudentSubmission,
	downloadStudentGrade,
	updateTest,
	deleteTest
} from '../controllers/lecturerController';

const router = express.Router();
router.use(verifyToken);

/**
 * @route GET /courses
 * @description View all courses lectured or currently is by the user.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of courses
 * @returns {number} 200.enrolmentId - Unique identifier of the course enrolment
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.courseDescription - Course description
 * @returns {string} 200.term - Term of the course
 * @returns {string} 200.year - Year of the course
 */
router.get('/courses',viewLecturedCourses);

/**
 * @route GET /courses/:courseId
 * @description View the details of a specific course that the user is lecturing.
 * @param {string} courseId - Unique identifier of the course offering
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Course details
 * @returns {string} 200.enrolmentId - Unique identifier of the course enrolment
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.courseDescription - Course description
 * @returns {string} 200.term - Term of the course
 * @returns {string} 200.year - Year of the course
 * @returns {object[]} 200.assignments - List of assignments
 * @returns {string} 200.assignments.assignmentId - Unique identifier of the assignment
 * @returns {string} 200.assignments.assignmentName - Name of the assignment
 * @returns {string} 200.assignments.assignmentDescription - Description of the assignment
 * @returns {string} 200.assignments.dueDate - Due date of the assignment
 * @returns {boolean} 200.assignments.isGroupAssignment - Whether the assignment is a group assignment
 * @returns {string} 200.assignments.defaultShCmd - Default shell command for the assignment
 * @returns {object[]} 200.enrolledStudents - List of students enrolled in the course
 * @returns {string} 200.enrolledStudents.zid - ZID of the student
 * @returns {string} 200.enrolledStudents.firstName - First name of the student
 * @returns {string} 200.enrolledStudents.lastName - Last name of the student
 * @returns {string} 200.enrolledStudents.email - Email of the student
 */
router.get('/courses/:courseId',viewLecturedCourseDetails);

/**
 * @route POST /courses/:courseId/assignments
 * @description Create a new assignment for a course.
 * @param {string} courseId - Unique identifier of the course
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} assignmentName - Name of the assignment
 * @body {string} description - Description of the assignment
 * @body {string} dueDate - Due date of the assignment in '"YYYY-MM-DD HH:mm"' format
 * @body {boolean} isGroupAssignment - Whether the assignment is a group assignment
 * @body {string} defaultShCmd - Default shell command for the assignment
 * @body {string} autoTestWeighting - Weighting of the auto test
 * @returns {object} 201 - Created assignment details
 * @returns {number} 201.assignmentId - Unique identifier of the created assignment
 * @returns {string} 201.assignmentName - Name of the assignment
 * @returns {string} 201.description - Description of the assignment
 * @returns {string} 201.dueDate - Due date of the assignment
 * @returns {boolean} 201.isGroupAssignment - Group assignment status
 */
router.post('/courses/:courseId/assignments', validateAssignmentData, createAssignment);

/**
 * @route PUT /courses/:courseId/assignments/:assignmentId
 * @description Update an existing assignment.
 * @param {string} courseId - Unique identifier of the courseOffering
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} assignmentName - Updated name of the assignment
 * @body {string} description - Updated description of the assignment
 * @body {string} dueDate - Updated due date in "YYYY-MM-DD HH:mm" format
 * @body {boolean} isGroupAssignment - Updated group assignment status
 * @body {string} defaultShCmd - Updated default shell command
 * @body {string} autoTestWeighting - Updated weighting of the auto test
 * @returns {object} 200 - Updated assignment details
 * @returns {number} 200.assignmentId - Unique identifier of the assignment
 * @returns {string} 200.assignmentName - Name of the assignment
 * @returns {string} 200.description - Description of the assignment
 * @returns {string} 200.dueDate - Due date of the assignment
 * @returns {boolean} 200.isGroupAssignment - Group assignment status
 */
router.put('/courses/:courseId/assignments/:assignmentId', validateAssignmentData, updateAssignment );

/**
 * @route DELETE /courses/:courseId/assignments/:assignmentId
 * @description Delete an assignment from a course.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Deletion confirmation
 * @returns {string} 200.message - Success message
 */
router.delete('/assignments/:assignmentId', validateLecturerPermissions, deleteAssignment);

/**
 * @route GET /assignments/:assignmentId/view
 * @description View a specific assignment.
 * @param {string} assignmentId - Unique identifier of the assignment.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Assignment details
 * @returns {number} 200.assignmentId - Unique identifier of the assignment
 * @returns {string} 200.assignmentName - Name of the assignment
 * @returns {string} 200.description - Description of the assignment
 * @returns {string} 200.dueDate - Due date of the assignment
 * @returns {boolean} 200.isGroupAssignment - Group assignment status
 * @returns {float} 200.autoTestWeighting - Weighting of the auto tests.
 * @returns {string} 200.defaultShCmd - Default shell command for the assignment
 * @returns {string} 200.autoTestExecutable - Auto test executable for the assignment
 * @returns {string} 200.autoTestWeighting - Weighting of the auto test
 * @returns {object[]} 200.testCases - List of test cases for the assignment
 * @returns {object[]} 200.submissions - List of submissions for the assignment
 * @returns {object} 404 - Assignment not found
 * @returns {object} 500 - Internal server error
 */
router.get('/assignments/:assignmentId/view', viewAssignment);

/**
 * @route POST /courses/:courseId/assignments/:assignmentId/testcases
 * @description Create a new test case for a specific assignment.
 * @param {string} assignmentId - Unique identifier of the assignment.
 * @body {string} input - The input for the test case.
 * @body {string} output - The expected output for the test case.
 * @body {boolean} [isHidden] - Optional flag indicating if the test case is hidden.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 201 - The created test case.
 * @returns {number} 201.id - Unique identifier of the test case.
 * @returns {string} 201.input - The input for the test case.
 * @returns {string} 201.expectedOutput - The expected output for the test case.
 * @returns {boolean} 201.isHidden - Whether the test case is hidden.
 * @returns {number} 201.assignmentId - Unique identifier of the assignment.
 */
router.post('/assignments/:assignmentId/testcases', validateLecturerPermissions, createTest);

/**
 * @route PUT /testcases/:testId
 * @description Update a test case for a specific assignment.
 * @param {string} testId - Unique identifier of the test case.
 * @body {string} input - The input for the test case.
 * @body {string} output - The expected output for the test case.
 * @body {boolean} [isHidden] - Optional flag indicating if the test case is hidden.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - The updated test case.
 * @returns {number} 200.id - Unique identifier of the test case.
 * @returns {string} 200.input - The input for the test case.
 * @returns {string} 200.expectedOutput - The expected output for the test case.
 * @returns {boolean} 200.isHidden - Whether the test case is hidden.
 * @returns {number} 200.assignmentId - Unique identifier of the assignment.
 */
router.put('/testcases/:testId', updateTest);

/**
 * @route DELETE /testcases/:testId
 * @description Delete a test case for a specific assignment.
 * @param {string} testId - Unique identifier of the test case.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Deletion confirmation
 * @returns {string} 200.message - Success message
 * @returns {object} 404 - Test case not found
 */
router.delete('/testcases/:testId', deleteTest);

/**
 * @route GET /assignments/:assignmentId/submissions
 * @description View all submissions for a specific assignment.
 * @param {string} assignmentId - Unique identifier of the assignment.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of submissions
 * @returns {number} 200.id - Unique identifier of the submission
 * @returns {number?} 200.studentId - Unique identifier of the student
 * @returns {number?} 200.groupId - Unique identifier of the group
 * @returns {DateTime} 200.submissionTime - Time of submission
 * @returns {boolean} 200.isMarked - Whether the submission has been marked
 */
router.get('/assignments/:assignmentId/submissions', viewAllSubmissions);

/**
 * @route GET /submissions/:submissionId/view
 * @description View the details of a specific submission.
 * @param {string} submissionId - Unique identifier of the submission.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Submission details
 * @returns {number} 200.id - Unique identifier of the submission
 * @returns {number?} 200.studentId - Unique identifier of the student
 * @returns {number?} 200.groupId - Unique identifier of the group
 * @returns {DateTime} 200.submissionTime - Time of submission
 * @returns {SubmissionType} 200.submissionType - Type of submission
 * @returns {boolean} 200.isMarked - Whether the submission has been marked
 * @returns {number?} 200.automark - Automark result
 * @returns {number?} 200.stylemark - Stylemark result
 * @returns {number?} 200.finalMark - Final mark
 * @returns {string?} 200.comments - Marker comments
 * @returns {number?} 200.latePenalty - Late penalty
 */
router.get('/submissions/:submissionId/view', viewSubmission);

/**
 * @route GET /students
 * @description Search for students in a specific course.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} courseId - Unique identifier of the course offering.
 * @returns {object[]} 200 - List of students.
 * @returns {string} 200.zid - ZID of the student.
 * @returns {string} 200.fistName - First name of the student.
 * @returns {string} 200.lastName - Last name of the student.
 * @returns {string} 200.email - Email of the student.
 */
router.get('/courses/:courseId/students', getStudentsInCourse);

/**
 * @route GET /students/:studentId
 * @description Retrieve details for a specific student.
 * @param {string} studentId - ZID of the student.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Details of the student.
 * @returns {string} 200.zid - ZID of the student.
 * @returns {string} 200.name - Name of the student.
 * @returns {string} 200.email - Email of the student.
 * @returns {object[]} 200.enrollments - List of courses the student is enrolled in.
 */
router.get('/students/:studentId', searchStudentById);

/**
 * @route POST /courses/:courseId/assignments/:assignmentId/mark
 * @description Begin the automated marking process for an assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Success message
 */
router.post('/assignments/:assignmentId/mark', markAllSubmissions);

/**
 * @route GET /submissions/:submissionId/download
 * @description Download the submission file for a specific submission.
 * @param {string} submissionId - Unique identifier of the submission.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {file} 200 - The submission file attachment.
 */
router.get('/submissions/:submissionId/download', downloadStudentSubmission);

/**
 * @route POST '/course-offerings/:courseOfferingId/upload-student-csv'
 * @description Import students, classes, tutors for a specific course offering from a CSV file.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} courseOfferingId - The unique identifier of the course offering
 * @body {file} body.file - The CSV file to import
 * @returns {object} 201 - Success message
 * @returns {string} 201.message - Success message
 */
router.post('/course-offerings/:courseOfferingId/upload-student-csv', uploadCsv, importCsv);

/**
 * @route GET /assignments/:assignmentId/grades
 * @description Download the grades for a specific assignment.
 * @param {string} assignmentId - Unique identifier of the assignment.
 * @header {string} Authorization - Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {file} 200 - The grades file attachment.
 */
router.get('/assignments/:assignmentId/grades', downloadStudentGrade);

export default router;