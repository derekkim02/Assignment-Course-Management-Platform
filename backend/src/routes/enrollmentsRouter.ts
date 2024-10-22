import express from 'express';
import { getEnrollment, getEnrollments } from '../controllers/enrollmentsController';

const router = express.Router();

router.get('/', getEnrollments);
router.get('/:enrollmentId', getEnrollment);

export default router;
