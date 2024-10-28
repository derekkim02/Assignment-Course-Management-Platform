import express from 'express';
import { homepage, submitAssignment, viewMarks, viewAssignment } from '../controllers/studentController';
import { verifyToken } from '../jwtUtils';

const router = express.Router();
router.use(verifyToken);

// View student homepage
router.get('/homepage', homepage);

// Submit an assignment
router.post('/courses/:courseId/assignments/:assignmentId/submit', submitAssignment);

// View marks
router.get('/marks', viewMarks);

// View assignment details
router.get('/courses/:courseId/assignments/:assignmentId/view', viewAssignment);

// Fetch all upcoming assignments
router.get('/courses/:courseId/assignments', );

// Fetch all enrolled courses
router.get('/courses', );

// Fetch submissions for an assignment
router.get('');

export default router;