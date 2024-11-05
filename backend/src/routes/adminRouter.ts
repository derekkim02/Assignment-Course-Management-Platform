import express from 'express';
import {
	changeAdminRole,
	createCourse,
	createEnrollment,
	getCourseOffering,
	getCourseOfferings,
	getCourses,
	getUsers,
	importCsv,
	updateCourseOffering
} from '../controllers/adminController';
import { checkIgiveAdmin, verifyToken } from '../middleware/jwt';
import { uploadCsv } from 'middleware/multer';

const router = express.Router();

router.use(verifyToken, checkIgiveAdmin);

router.put('/change-role/:userId', changeAdminRole);

/**
 * @route POST /course-offerings
 * @description Create a new course offering.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} body.lecturerId - The unique identifier of the lecturer
 * @body {string} body.courseId - The unique identifier of the course
 * @body {string} body.termYear - The year of the term
 * @body {number} body.termTerm - The term of the course offering
 * @returns {object} 201 - Success message
 * @returns {string} 201.message - Success message
 */
router.post('/course-offerings', createEnrollment);
router.get('/courses', getCourses);


/**
 * @route POST /courses
 * @description Create a new course.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} body.name - The name of the course
 * @body {string} body.code - The code of the course
 * @body {string} body.description - The description of the course
 * @returns {object} 201 - The newly created course
 * @returns {string} 201.id - The unique identifier of the course
 * @returns {string} 201.name - The name of the course
 * @returns {string} 201.code - The code of the course
 * @returns {string} 201.description - The description of the course
 */
router.post('/courses', createCourse);
router.get('/users', getUsers);

/**
 * @route GET /course-offerings
 * @description Fetch all course offerings.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of course offerings
 * @returns {string} 200.id - Unique identifier of the course offering
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.term - Term of the course offering in the format `yearTerm`
 * @returns {object} 500 - Internal server error
 * @returns {string} 500.error - Error message
 */
router.get('/course-offerings', getCourseOfferings);

/**
 * @route GET /course-offerings/:courseOfferingId
 * @description Fetch a specific course offering.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} courseOfferingId- The unique identifier of the course offering
 * @returns {object} 200 - Course offering
 * @returns {string} 200.id - Unique identifier of the course offering
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.term - Term of the course offering in the format `yearTerm`
 * @returns {User} 200.lecturer - Lecturer for the course offering.
 * @returns {User[]} 200.students - list of students enrolled in the course offering.
 * @returns {User[]} 200.tutors - list of tutors for the course offering.
 * @returns {object} 500 - Internal server error
 * @returns {string} 500.error - Error message
 */
router.get('/course-offerings/:courseOfferingId', getCourseOffering);

/**
 * @route PUT /course-offerings/:courseOfferingId
 * @description Update a specific course offering.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} courseOfferingId - The unique identifier of the course offering
 * @body {string} body.lecturerId - The unique identifier of the lecturer
 * @body {string[]} body.studentIds - The unique identifiers of the students
 * @body {string[]} body.tutorIds - The unique identifiers of the tutors
 * @body {string} body.courseId - The unique identifier of the course
 * @returns {object} 200 - Course offering
 * @returns {string} 200.id - Unique identifier of the course offering
 * @returns {string} 200.courseCode - Course code
 * @returns {string} 200.courseName - Course name
 * @returns {string} 200.term - Term of the course offering in the format `yearTerm`
 */
router.put('/course-offerings/:courseOfferingId', updateCourseOffering);

/**
 * @route POST /course-offerings/:courseOfferingId/import-csv
 * @description Import students, classes, tutors for a specific course offering from a CSV file.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} courseOfferingId - The unique identifier of the course offering
 * @body {file} body.file - The CSV file to import
 * @returns {object} 201 - Success message
 * @returns {string} 201.message - Success message
 */
router.post('/course-offerings/:courseOfferingId/import-csv', uploadCsv ,importCsv);

export default router;
