import express from 'express';

const router = express.Router();

// Homepage
router.get('/homepage', );

// Create assignment
router.post('/courses/:courseId/assignments', );

// Change assignment details
router.put('/courses/:courseId/assignments/:assignmentId', );

// Delete assignment
router.delete('/courses/:courseId/assignments/:assignmentId', );

// View assignment details
router.get('/courses/:courseId/assignments/:assignmentId/view', );

// View all submissions for an assignment
router.get('/courses/:courseId/assignments/:assignmentId/submissions', );

// View a submission's content
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/view', );

// Search for students
router.get('/students', );

// Look at student details
router.get('/students/:studentId', );

// Start auto-marking for every submission in the course
router.post('/courses/:courseId/assignments/:assignmentId/mark', );

// Download a student submission
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/download', );

// Upload a CSV file to update student database
router.post('/upload-student-csv', );

export default router;