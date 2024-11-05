import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { validateAssignmentData } from '../middleware/assignment';
import { 
	createAssignment,
	searchStudentById,
	getStudentsInCourse,
	viewSubmission,
	createTest,
	updateAssignment,
	viewAssignment,
	deleteAssignment,
	viewLecturedCourses,
	viewLecturedCourseDetails,
	markAllSubmissions
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
 * @body {string} dueDate - Due date of the assignment in 'dd/MM/yyyy' format
 * @body {boolean} isGroupAssignment - Whether the assignment is a group assignment
 * @body {string} term - Term of the course (e.g., '23T3')
 * @body {string} defaultShCmd - Default shell command for the assignment
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
 * @param {string} courseId - Unique identifier of the course
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} assignmentName - Updated name of the assignment
 * @body {string} description - Updated description of the assignment
 * @body {string} dueDate - Updated due date in 'dd/MM/yyyy' format
 * @body {boolean} isGroupAssignment - Updated group assignment status
 * @body {string} term - Term of the course (e.g., '23T3')
 * @body {string} defaultShCmd - Updated default shell command
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
 * @param {string} courseId - Unique identifier of the course
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Deletion confirmation
 * @returns {string} 200.message - Success message
 */
router.delete('/courses/:courseId/assignments/:assignmentId', deleteAssignment);

/**
 * @route GET /courses/:courseId/assignments
 * @description View all assignments for a specific course.
 * @param {string} courseId - Unique identifier of the course
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of assignments
 * @returns {number} 200.assignmentId - Unique identifier of the assignment
 * @returns {string} 200.assignmentName - Name of the assignment
 * @returns {string} 200.description - Description of the assignment
 * @returns {string} 200.dueDate - Due date of the assignment
 * @returns {boolean} 200.isGroupAssignment - Group assignment status
 * @returns {string} 200.term - Term of the assignment
 */
router.get('/courses/:courseId/assignments/:assignmentId/view', viewAssignment);

// Create test case for an assignment
router.post('/courses/:courseId/assignments/:assignmentId/testcases', createTest);

// View all submissions for an assignment
router.get('/courses/:courseId/assignments/:assignmentId/submissions', );

// View a submission's content
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/view', viewSubmission);

// Search for students in a specific course
router.get('/students', getStudentsInCourse);

// Look at student details
router.get('/students/:studentId', searchStudentById);

/**
 * @route POST /courses/:courseId/assignments/:assignmentId/mark
 * @description Begin the automated marking process for an assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Success message
 */
router.post('/assignments/:assignmentId/mark', markAllSubmissions);

// Download a student submission
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/download', );

// Upload a CSV file to update student database
router.post('/upload-student-csv', );

export default router;