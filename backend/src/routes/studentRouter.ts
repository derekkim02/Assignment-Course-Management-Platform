/**
 * @module routes/studentRouter
 * @requires express
 */

import express from 'express';
import { homepage, submitAssignment, submitGroupAssignment, viewMarks, viewAssignment } from '../controllers/studentController';
import { verifyToken } from '../jwtUtils';
import { uploadSubmission } from '../middleware/multer';
import { validateSingleSubmission, validateGroupSubmission } from '../middleware/submission';

const router = express.Router();
router.use(verifyToken);

// View student homepage
router.get('/homepage', homepage);

/**
 * @route POST /assignments/:assignmentId/submit
 * @description Submit an student assignment. This route is used to submit an individual assignment.
 * @param {string} assignmentId - Unique identifier of the assignment
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

// Fetch all assignments
router.get('/assignments', );

// Fetch all submitted assignments
router.get('/assignments/submitted', );

// Fetch all enrolled courses
router.get('/courses', );

// Fetch course details
router.get('/courses/:courseId', );


export default router;