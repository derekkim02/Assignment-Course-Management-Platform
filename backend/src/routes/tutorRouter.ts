import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { 
	viewTutoredCourses,
	viewTutoredCourseDetails,
	viewAssignmentDetails
} from '../controllers/tutorController';

const router = express.Router();
router.use(verifyToken);

/**
 * @route GET /courses
 * @description View all courses tutored by the user.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of courses
 * @returns {number} 200.enrolmentId - Unique identifier of the course enrolment
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.courseDescription - Course description
 * @returns {string} 200.term - Term of the course
 * @returns {string} 200.year - Year of the course
 */
router.get('/courses', viewTutoredCourses);

/**
 * @route GET /courses/:courseId
 * @description View the details of a specific course that the user is tutoring.
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
 * @returns {string} 200.assignments.assignmentName - Assignment name
 * @returns {string} 200.assignments.assignmentDescription - Assignment description
 * @returns {string} 200.assignments.dueDate - Due date of the assignment
 * @returns {boolean} 200.assignments.isGroupAssignment - Whether the assignment is a group assignment
 * @returns {string} 200.assignments.defaultShCmd - Default shell command for the assignment
 */
router.get('/courses/:courseId', viewTutoredCourseDetails);

/**
 * @route GET /assignments/:assignmentId
 * @description View the details of a specific assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object} 200 - Assignment details
 * @returns {string} 200.assignmentId - Unique identifier of the assignment
 * @returns {string} 200.assignmentName - Assignment name
 * @returns {string} 200.assignmentDescription - Assignment description
 * @returns {string} 200.dueDate - Due date of the assignment
 * @returns {boolean} 200.isGroupAssignment - Whether the assignment is a group assignment
 * @returns {string} 200.defaultShCmd - Default shell command for the assignment
 */
router.get('/assignments/:assignmentId', viewAssignmentDetails);

// View a submission's content
router.get('/submissions/:submissionId', );

// Assign a mark to a student submission
router.put('submissions/:submissionId', );

// Download a student submission
router.get('/submissions/:submissionId/download', );

// Search for students
router.get('/students', );


export default router;