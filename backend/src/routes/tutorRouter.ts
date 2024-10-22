import express from 'express';
import { verifyToken } from '../jwtUtils';

const router = express.Router();
router.use(verifyToken);

// View tutor homepage
router.get('/homepage', );

// View assignment details
router.get('/courses/:courseId/assignments/:assignmentId/view', );

// View a submission's content
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/view', );

// View submission mark
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/mark', );

// Assign a mark to a student submission
router.put('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/mark', );

// Download a student submission
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/download', );

// Search for students
router.get('/students', );


export default router;