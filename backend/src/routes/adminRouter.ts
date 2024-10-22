import express from 'express';
import { changeAdminRole, createCourse, createEnrollment, getCourses } from '../controllers/adminController';
import { checkIgiveAdmin, verifyToken } from '../jwtUtils';

const router = express.Router();

router.use(verifyToken, checkIgiveAdmin);

router.put('/change-role/:userId', changeAdminRole);
router.post('/course-offerings', createEnrollment);
router.get('/courses', getCourses);
router.post('/courses', createCourse);

export default router;
