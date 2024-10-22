import express from 'express';
import { homepage, submitAssignment, viewMarks, viewAssignment } from '../controllers/studentController';
import { verifyToken } from '../jwtUtils';

const router = express.Router();
router.use(verifyToken);

// View student homepage
router.get('/homepage', homepage);

// Submit an assignment
router.post('/assignments/:assignmentId/submit', submitAssignment);

// Submit group assignment
router.post('/assignments/group/submit', );

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