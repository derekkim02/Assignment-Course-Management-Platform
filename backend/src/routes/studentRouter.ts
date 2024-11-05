/**
 * @module routes/studentRouter
 * @requires express
 */

import express from 'express';
import { submitAssignment, submitGroupAssignment, viewMarks, viewAssignment, viewCourseEnrollments, viewCourseEnrollmentDetails } from '../controllers/studentController';
import { verifyToken } from '../middleware/jwt';
import { uploadSubmission } from '../middleware/multer';
import { validateSingleSubmission, validateGroupSubmission } from '../middleware/submission';

const router = express.Router();
router.use(verifyToken);

/**
 * @route POST /assignments/:assignmentId/submit
 * @description Submit an student assignment. This route is used to submit an individual assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {file} submission - The submission file
 * @consumes multipart/form-data
 * @returns {object} 200 - Submission results
 * @returns {object[]} 200.results - List of individual test results.
 * @returns {boolean} 200.results.passed - Whether the test case passed.
 * @returns {string} 200.results.message - Message about the test case result.
 * @returns {number} 200.total - Total number of test cases.
 * @returns {number} 200.passed - Total number of passed test cases.
 * @returns {number} 200.failed - Total number of failed test cases.
 */
router.post('/assignments/:assignmentId/submit', validateSingleSubmission, uploadSubmission, submitAssignment);

/**
 * @route POST /assignments/:assignmentId/group/submit
 * @description Submit a group assignment. This route is used to submit a group assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {file} submission - The submission file
 * @body {groupId} group - The group identifier
 * @consumes multipart/form-data
 * @returns {object} 200 - Submission results
 * @returns {object[]} 200.results - List of individual test results.
 * @returns {boolean} 200.results.passed - Whether the test case passed.
 * @returns {string} 200.results.message - Message about the test case result.
 * @returns {number} 200.total - Total number of test cases.
 * @returns {number} 200.passed - Total number of passed test cases.
 * @returns {number} 200.failed - Total number of failed test cases.
 * @returns {string} 200.message - Message about the submission.
 */
router.post('/assignments/:assignmentId/group/submit',validateGroupSubmission, uploadSubmission, submitGroupAssignment);

// View marks
router.get('/marks', viewMarks);

// View assignment details
router.get('/assignments/:assignmentId/view', viewAssignment);

// Fetch all upcoming assignments
router.get('/assignments/new', );

// Fetch all submitted assignments
router.get('/assignments/submitted', );

/**
 * @route GET /courses
 * @description Fetch all courses that the student is enrolled in. Contains basic course information.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of courses
 * @returns {number} 200.enrolmentId - Unique identifier of the course enrolment
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.courseDescription - Course description
 * @returns {string} 200.term - Term of the course
 * @returns {string} 200.year - Year of the course
 */
router.get('/courses', viewCourseEnrollments);

/**
 * @route GET /courses/:courseId
 * @description Fetch all course details for a specific course offering.
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
router.get('/courses/:courseId', viewCourseEnrollmentDetails);

// Fetch submissions for an assignment
router.get('/courses/:courseId/assignments/:assignmentId', );

export default router;