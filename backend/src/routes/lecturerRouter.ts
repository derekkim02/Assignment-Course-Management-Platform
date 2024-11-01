import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { createAssignment, searchStudentById, getStudentsInCourse, viewSubmission, createTest, updateAssignment } from '../controllers/lecturerController';

const router = express.Router();
router.use(verifyToken);

// Homepage
router.get('/homepage', );

// Create assignment
router.post('/courses/:courseId/assignments', createAssignment);

// Change assignment details
router.put('/courses/:courseId/assignments/:assignmentId', updateAssignment );

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

// Start auto-marking for every submission in the course
router.post('/courses/:courseId/assignments/:assignmentId/mark', );

// Download a student submission
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/download', );

// Upload a CSV file to update student database
router.post('/upload-student-csv', );

export default router;