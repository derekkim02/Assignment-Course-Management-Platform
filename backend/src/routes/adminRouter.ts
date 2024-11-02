import express from 'express';
import { changeAdminRole, createCourse, createEnrollment, getCourses, getUsers } from '../controllers/adminController';
import { checkIgiveAdmin, verifyToken } from '../middleware/jwt';

const router = express.Router();

router.use(verifyToken, checkIgiveAdmin);

router.put('/change-role/:userId', changeAdminRole);
router.post('/course-offerings', createEnrollment);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/users', getUsers);

export default router;
