import express from 'express';

const router = express.Router();

// View tutor homepage
router.get('/homepage', );

// View assignment details
router.get('/:assignment/view', );

// View a submission's content
router.get('/:assignment/:submission/view', );

// View submission mark
router.get('/:assignment/:submission/mark', );

// Assign a mark to a student submission
router.put('/:assignment/:submission/mark', );

// Download a student submission
router.get('/:assignment/:submission/download', );

// Search for students
router.get('/students', );


export default router;