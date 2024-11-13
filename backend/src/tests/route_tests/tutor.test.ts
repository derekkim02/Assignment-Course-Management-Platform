import {beforeEach, describe, expect, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeEach(async () => {
	await resetDatabase();
});

const generateDbData = async (): Promise<{
	token1: string,
	token2: string,
    token3: string,
	assigmentId: number,
	groupAssignmentId: number,
	courseId: number,
	courseOfferingId: number,
	courseOfferingTerm: number,
	courseOfferingYear: number,
	studentId: number,
}> => {
	// Registers 2 users
    // user1 LECTURER/TUTOR, user2 STUDENT, user3 TUTOR
	await request(app)
		.post('/api/auth/register')
		.send({
			firstName: 'user',
			lastName: '1',
			email: 'user1@gmail.com',
			password: 'bananas',
			cpassword: 'bananas'
		}).expect(201);

	await request(app)
		.post('/api/auth/register')
		.send({
			firstName: 'user',
			lastName: '2',
			email: 'user2@gmail.com',
			password: 'bananas',
			cpassword: 'bananas'
		})
		.expect(201);

    await request(app)
		.post('/api/auth/register')
		.send({
			firstName: 'user',
			lastName: '3',
			email: 'user3@gmail.com',
			password: 'bananas',
			cpassword: 'bananas'
		}).expect(201);

	// Get the token by logging in
	const user1 = await request(app)
		.post('/api/auth/login')
		.send({
			email: 'user1@gmail.com',
			password: 'bananas',
		}).expect(200);

	const user2 = await request(app)
		.post('/api/auth/login')
		.send({
			email: 'user2@gmail.com',
			password: 'bananas',
		}).expect(200);

    const user3 = await request(app)
		.post('/api/auth/login')
		.send({
			email: 'user3@gmail.com',
			password: 'bananas',
		}).expect(200);

	const token1 = user1.body.token;
	const token2 = user2.body.token;
    const token3 = user3.body.token;

	// Admin creates a course
	const course = await request(app)
		.post('/api/admin/courses')
		.set('authorization', `Bearer ${token1}`)
		.send({
			name: 'Programming Fundamentals',
			code: 'Comp1511',
			description: 'An introduction to programming'
		})
		.expect(201);

	// Admin gets the zid of the user1
	const users = await request(app)
		.get('/api/admin/users')
		.set('authorization', `Bearer ${token1}`)
		.expect(200);

	const zid1 = users.body[0].zid;
	const zid2 = users.body[1].zid;
    const zid3 = users.body[2].zid;

	// Admin creates a course offering
	const courseOffering = await request(app)
		.post('/api/admin/course-offerings')
		.set('authorization', `Bearer ${token1}`)
		.send({
			courseId: course.body.id,
			termYear: 2024,
			termTerm: 1,
			lecturerId: zid1,
		})
		.expect(201);

	// Admin updates the course offering to include user2
	await request(app)
		.put(`/api/admin/course-offerings/${courseOffering.body.id}`)
		.set('authorization', `Bearer ${token1}`)
		.send({
			lecturerId: zid1,
			studentIds: [zid2],
			tutorsIds: [zid1, zid3],
		}).expect(201);


	// Admin creates an assignmen
	const assignment = await request(app)
		.post(`/api/lecturer/courses/${courseOffering.body.id}/assignments`)
		.set('authorization', `Bearer ${token1}`)
		.send({
			assignmentName: 'Python 3 Example',
			description: 'This is an example assignment for Python 3',
			dueDate: '2024-11-20 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py',
			autoTestWeighting: 0.6,
		}).expect(201);

	const groupAssignment = await request(app)
	.post(`/api/lecturer/courses/${courseOffering.body.id}/assignments`)
	.set('authorization', `Bearer ${token1}`)
	.send({
		assignmentName: 'Python 3 Example',
		description: 'This is an example assignment for Python 3',
		dueDate: '2024-12-21 20:00',
		isGroupAssignment: true,
		defaultShCmd: 'python3 main.py',
		autoTestWeighting: 0.6,
	}).expect(201);

	return {
		token1,
		token2,
        token3,
		assigmentId: assignment.body.id,
		groupAssignmentId: groupAssignment.body.id,
		courseId: course.body.id,
		courseOfferingId: courseOffering.body.id,
		courseOfferingTerm: courseOffering.body.termTerm,
		courseOfferingYear: courseOffering.body.termYear,
		studentId: zid2,
	};
}
/*
describe('GET api/tutor/courses', () => {
	test('Successful view tutor courses', async () => {
		const {token3} = await generateDbData();
		await request(app)
		.get(`/api/tutor/courses`)
		.set('authorization', `Bearer ${token3}`)
		.expect('Content-Type', /json/)
		.expect(200)
	});
})

describe('GET api/tutor/courses/:courseId', () => {
	test('Successful view specific tutor course details', async () => {
		const {token3, courseOfferingId} = await generateDbData();
		await request(app)
		.get(`/api/tutor/courses/${courseOfferingId}`)
		.set('authorization', `Bearer ${token3}`)
		.expect('Content-Type', /json/)
		.expect(200)
	});

    test('Error view specific tutor course details, invalid course id', async () => {
		const {token3} = await generateDbData();
		await request(app)
		.get(`/api/tutor/courses/${123987}`)
		.set('authorization', `Bearer ${token3}`)
		.expect('Content-Type', /json/)
        .expect({ error: 'Course not found or you are not the tutor for this course' })
		.expect(404)
	});
})

describe('GET api/tutor/assignments/:assignmentId', () => {
	test('Successful view specific assignment details', async () => {
		const {token3, assigmentId} = await generateDbData();
		await request(app)
		.get(`/api/tutor/assignments/${assigmentId}`)
		.set('authorization', `Bearer ${token3}`)
		.expect('Content-Type', /json/)
		.expect(200)
	});

	test('Error view specific assignment details, invalid assignmentId', async () => {
		const {token3} = await generateDbData();
		await request(app)
		.get(`/api/tutor/assignments/${123987}`)
		.set('authorization', `Bearer ${token3}`)
		.expect('Content-Type', /json/)
		.expect({ error: 'Assignment not found or you are not the tutor for this course' })
		.expect(404)
	});
})

describe('GET api/tutor/assignments/:assignmentId/submissions', () => {
	const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');
    test('Successful view all submissions', async () => {
        const {token3, token2, assigmentId} = await generateDbData();

		// Submits
		await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`)
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', py3FilePath)
			.expect(201);

        await request(app)
        .get(`/api/tutor/assignments/${assigmentId}/submissions`)
        .set('authorization', `Bearer ${token3}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });

	test('Error view all submissions, invalid assignment id', async () => {
        const {token3} = await generateDbData();
        await request(app)
        .get(`/api/lecturer/assignments/${123987}/submissions`)
        .set('authorization', `Bearer ${token3}`)
        .expect('Content-Type', /json/)
		.expect({ error: 'Assignment not found' })
        .expect(404);
    });
})

describe('GET api/tutor/submissions/:submissionId/', () => {
	const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');
    test('Successful view submission', async () => {
        const {token3, token2, assigmentId} = await generateDbData();

		// Submits
		const submission = await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`)
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', py3FilePath)
			.expect(201);
		const submissionId = submission.body.submissionId;

        await request(app)
        .get(`/api/tutor/submissions/${submissionId}`)
        .set('authorization', `Bearer ${token3}`)
		.send({
			submissionId: submissionId,
		})
        .expect('Content-Type', /json/)
        .expect(200);
    });

	test('Error view submission, submission not found', async () => {
        const {token3} = await generateDbData();
		const submissionId = 123
        await request(app)
        .get(`/api/tutor/submissions/${submissionId}`)
        .set('authorization', `Bearer ${token3}`)
		.send({
			submissionId: submissionId,
		})
        .expect('Content-Type', /json/)
		.expect({ error: 'Submission not found or you are not the tutor for this course' })
        .expect(404);
    });
})
*/

// describe('PUT api/tutor/submissions/:submissionId/', () => {
//     const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');
//     test('Successful mark assignment', async () => {
//         const {token2, token3, assigmentId} = await generateDbData();

//         const submission = await request(app)
// 			.post(`/api/student/assignments/${assigmentId}/submit`)
// 			.set('authorization', `Bearer ${token2}`)
// 			.attach('submission', py3FilePath)
// 			.expect(201);
// 		const submissionId = submission.body.submissionId;

//         //router.put('submissions/:submissionId', markSubmission);
//         await request(app)
//         .put(`/api/tutor/submissions/${submissionId}`)
//         .set('authorization', `Bearer ${token3}`)
//         .send({
//             styleMark: 5,
//             comments: 'Example tutor comment on submission',
//         })
//         .expect('Content-Type', /json/)
//         .expect({ message: 'Submissions marked' })
//         .expect(200);
//     });

//     test('Error mark assignment, assignment not found', async () => {
//         const {token3} = await generateDbData();
//         await request(app)
//         .put(`/api/tutor/submissions/${123987}`)
//         .set('authorization', `Bearer ${token3}`)
//         .send({
//             styleMark: 5,
//             comments: 'Example tutor comment on submission',
//         })
//         .expect('Content-Type', /json/)
//         .expect({ error: 'Assignment not found or you are not the lecturer for this course' })
//         .expect(404);
//     });
// })

/*
router.put('submissions/:submissionId', markSubmission);
router.get('/submissions/:submissionId/download', downloadSubmission);
router.get('/courses/:courseId/students', viewStudents);
*/