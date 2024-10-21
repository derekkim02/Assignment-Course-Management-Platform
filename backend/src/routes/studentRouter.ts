import express from 'express';
import { homepage, submitAssignment, viewMarks, viewAssignment } from '../controllers/studentController';

const router = express.Router();
// View student homepage
router.get('/homepage', homepage);

// Submit an assignment
router.post('/:assignment/submit', submitAssignment);

// View marks
router.get('/marks', viewMarks);

// View assignment details
router.get('/:assignment/view', viewAssignment);

// Fetch all upcoming assignments
router.get('/assignments', );


export default router;