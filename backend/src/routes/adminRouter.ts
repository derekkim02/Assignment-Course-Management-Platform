import express from 'express';
import {
	addUserToEls,
	changeAdminRole,
	createCourse,
	createEls,
	createEnrollment,
	getAllEls,
	getCourseOffering,
	getCourseOfferings,
	getCourses,
	getEls,
	getUserEls,
	getUsers,
	importCsv,
	removeUserFromEls,
	updateCourseOffering,
	updateEls
} from '../controllers/adminController';
import { checkIgiveAdmin, verifyToken } from '../middleware/jwt';
import { uploadCsv } from '../middleware/multer';

const router = express.Router();

router.use(verifyToken, checkIgiveAdmin);

router.put('/change-role/:userId', changeAdminRole);

/**
 * @route POST /course-offerings
 * @description Create a new course offering.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {int} body.lecturerId - The unique identifier of the lecturer
 * @body {string} body.courseId - The unique identifier of the course
 * @body {string} body.termYear - The year of the term
 * @body {number} body.termTerm - The term of the course offering
 * lecturerId: number;
    courseId: number;
    termYear: number;
    termTerm: $Enums.Trimester;
    id: number;
    penaltyStrategy: $Enums.PenaltyStrategy
 * @returns {object} 201 - Course offering
 * @returns {number} 201.id - Unique identifier of the course offering
 * @returns {number} 201.lecturerId - The unique identifier of the lecturer
 * @returns {number} 201.courseId - The unique identifier of the course
 * @returns {number} 201.termYear - The year of the term
 * @returns {Term} 201.termTerm - The term of the course offering
 * @returns {PenaltyStrategy} 201.penaltyStrategy - The penalty strategy of the course offering
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


/**
 * @route GET /users
 * @description Fetch all users.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of users
 * @returns {string} 200.zid - Unique identifier of the user
 * @returns {string} 200.firstName - First name of the user
 * @returns {string} 200.lastName - Last name of the user
 * @returns {string} 200.email - Email of the user
 * @returns {string} 200.password - Password of the user
 * @returns {boolean} 200.isAdmin - Whether the user is an admin
 */
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
router.post('/course-offerings/:courseOfferingId/import-csv', uploadCsv, importCsv);

/**
 * @route POST /els
 * @description Create a new ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} body.name - The name of the ELS
 * @body {string} body.extraDays - The number of extra days for the ELS
 * @returns {object} 201 - The newly created ELS
 * @returns {string} 201.id - The unique identifier of the ELS
 * @returns {string} 201.name - The name of the ELS
 * @returns {string} 201.extraDays - The number of extra days for the ELS
 */
router.post('/els', createEls);

/**
 * @route GET /els/:elsId
 * @description Fetch a specific ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} elsId - The unique identifier of the ELS
 * @returns {object} 200 - ELS
 * @returns {string} 200.id - Unique identifier of the ELS
 * @returns {string} 200.name - Name of the ELS
 * @returns {string} 200.extraDays - Number of extra days for the ELS
 */
router.get('/els/:elsId', getEls);

/**
 * @route GET /els
 * @description Fetch all ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @returns {object[]} 200 - List of ELS
 * @returns {string} 200.id - Unique identifier of the ELS
 * @returns {string} 200.name - Name of the ELS
 * @returns {string} 200.extraDays - Number of extra days for the ELS
 */
router.get('/els', getAllEls);
/**
 * @route PUT /els/:elsId
 * @description Update a specific ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @body {string} body.name - The name of the ELS
 * @body {string} body.extraDays - The number of extra days for the ELS
 * @returns {object} 200 - success message
 */
router.put('/els/:elsId', updateEls);

/**
 * @route POST /users/:userId/els
 * @description Add a user to an ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} userId - The unique identifier of the user
 * @body {string} body.elsId - The unique identifier of the ELS
 * @body {string} body.startDate - The start date of the ELS
 * @body {string} body.endDate - The end date of the ELS
 * @returns {object} 201 - The elsDuration object
 * @returns {string} 201.studentId - The unique identifier of the student
 * @returns {string} 201.elsTypeId - The unique identifier of the ELS
 * @returns {string} 201.startDate - The start date of the ELS
 * @returns {string} 201.endDate - The end date of the ELS
 */
router.post('/users/:userId/els', addUserToEls);

/**
 * @route DELETE /users/:userId/els
 * @description Remove a user from an ELS.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} userId - The unique identifier of the user
 * @returns {object} 200 - Success message
 */
router.delete('/users/:userId/els', removeUserFromEls);

/**
 * @route GET /users/:userId/els
 * @description Fetch els for a specific user.
 * @header {string} Authorization Bearer token for authentication. Format: `Bearer {token}`.
 * @param {string} userId - The unique identifier of the user
 * @returns {object | null} 200 - ELS Duration, If the user has an ELS otherwise null
 * @returns {string} 200.studentId - The unique identifier of the student
 * @returns {string} 200.elsTypeId - The unique identifier of the ELS
 * @returns {string} 200.startDate - The start date of the ELS
 * @returns {string} 200.endDate - The end date of the ELS
 * @returns {object} 200.els - The ELS object
 * @returns {string} 200.els.id - The unique identifier of the ELS
 * @returns {string} 200.els.name - The name of the ELS
 * @returns {string} 200.els.extraDays - The number of extra days for the ELS
 */
router.get('/users/:userId/els', getUserEls);

export default router;
