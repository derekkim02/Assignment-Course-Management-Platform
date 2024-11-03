import express from 'express';
import { changeAdminRole, createCourse, createEnrollment, getCourseOffering, getCourseOfferings, getCourses, getUsers, updateCourseOffering } from '../controllers/adminController';
import { checkIgiveAdmin, verifyToken } from '../middleware/jwt';

const router = express.Router();

router.use(verifyToken, checkIgiveAdmin);

router.put('/change-role/:userId', changeAdminRole);
router.post('/course-offerings', createEnrollment);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/users', getUsers);
router.get('/course-offerings', getCourseOfferings);
router.get('/course-offerings/:courseOfferingId', getCourseOffering);
router.put('/course-offerings/:courseOfferingId', updateCourseOffering);

export default router;
