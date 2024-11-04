import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { 
	createAssignment,
	searchStudentById,
	getStudentsInCourse,
	viewSubmission,
	createTest,
	updateAssignment,
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
 * @description Create a new assignment for a specific course offering.
 * @param {string} courseId - Unique identifier of the course offering
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} title - Title of the assignment
 * @body {string} description - Description of the assignment
 * @body {string} dueDate - Due date of the assignment in ISO 8601 format
 * @body {boolean} isGroupAssignment - Whether the assignment is a group assignment
 * @body {string} defaultShCmd - Default shell command for the assignment
 * @returns {object} 201 - Created assignment
 * @returns {string} 201.id - Unique identifier of the assignment
 * @returns {string} 201.title - Title of the assignment
 * @returns {string} 201.description - Description of the assignment
 * @returns {string} 201.dueDate - Due date of the assignment
 * @returns {boolean} 201.isGroupAssignment - Whether the assignment is a group assignment
 * @returns {string} 201.defaultShCmd - Default shell command for the assignment
 * @returns {object} 400 - Bad request
 * @returns {string} 400.error - Error message
 */
router.post('/courses/:courseId/assignments', createAssignment);

// Change assignment details
router.put('/courses/:courseId/assignments/:assignmentId', updateAssignment);

// Delete assignment
router.delete('/courses/:courseId/assignments/:assignmentId', );

// View assignment details
router.get('/courses/:courseId/assignments/:assignmentId/view', );

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