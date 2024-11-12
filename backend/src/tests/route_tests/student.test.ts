import {beforeEach, describe, expect, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';
import { fileURLToPath } from 'url';
import path from 'path';
import tar from 'tar-stream';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeEach(async () => {
	await resetDatabase();
});

const generateDbData = async (): Promise<{token1: string, token2: string, assigmentId: number, groupAssignmentId: number, courseId: number}> => {
	// Registers 2 users
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

	const token1 = user1.body.token;
	const token2 = user2.body.token;

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
			tutorsIds: [zid1],
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
		assigmentId: assignment.body.id,
		groupAssignmentId: groupAssignment.body.id,
		courseId: course.body.id
	};
}

describe('POST api/student/assignments/:assignmentId/submit', () => {
	const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');
	test('successful submit assignment', async () => {
		const {token2, assigmentId} = await generateDbData();
		const response = await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`)
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', py3FilePath)
			.expect(201);
		expect(response.body.results).toEqual([]);
		});

	test('Error, group submission errors on individual submission', async () => {
		const {token2, groupAssignmentId} = await generateDbData();
		await request(app)
			.post(`/api/student/assignments/${groupAssignmentId}/submit`)
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', py3FilePath)
			.expect(400)
			.expect({ error: 'Group assignment submission not supported' });
		});
})

describe('GET api/student/submissions/:submissionId/download', () => {
	async function containsMainPy(tarGzBuffer: Buffer): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const extract = tar.extract();
			const gunzip = zlib.createGunzip();

			let mainPyFound = false;

			extract.on('entry', (header, stream, next) => {
				// Check if the file name is 'main.py'
				if (header.name.endsWith('main.py')) {
					mainPyFound = true;
					stream.resume(); // Proceed to next file
				} else {
					stream.resume(); // Resume to next file if not 'main.py'
				}
				stream.on('end', next);
			});

			extract.on('finish', () => resolve(mainPyFound));
			extract.on('error', reject);
			gunzip.on('error', reject);

			// Pipe the tar.gz data through gunzip and into tar-stream
			gunzip.pipe(extract);
			gunzip.end(tarGzBuffer);
		});
	}
	test('successful get submission', async () => {
		const testFile = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz')
		const {token2, assigmentId} = await generateDbData();
		const submission = await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`)
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', testFile)
			.expect(201);
		const submissionId = submission.body.submissionId;
		const getResponse = await request(app)
			.get(`/api/student/submissions/${submissionId}/download`)
			.set('authorization', `Bearer ${token2}`)
			.expect('Content-Type', 'application/gzip')
			.expect(200)
			.buffer()
			.parse((res, callback) => {
				res.setEncoding('binary');
				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					callback(null, Buffer.from(data, 'binary'));
				});
			});
		const tarGzBuffer = getResponse.body;
		expect(await containsMainPy(tarGzBuffer)).toBe(true);
		});

	test('Error, invalid submissionId', async () => {
		const testFile = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz')
		const {token2, assigmentId} = await generateDbData();
		await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`) // Submit assignment
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', testFile)
			.expect(201);
		await request(app)
			.get(`/api/student/submissions/${123987}/download`) // Invalid submissionId
			.set('authorization', `Bearer ${token2}`)
			.expect('Content-Type', /json/)
			.expect(404)
			.expect({ error: 'Submission not found or you do not have permission' });
	});

	test('Error, student not authorised', async () => {
		const testFile = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz')
		const {token1, token2, assigmentId} = await generateDbData();
		await request(app)
			.post(`/api/student/assignments/${assigmentId}/submit`) // Submit assignment
			.set('authorization', `Bearer ${token2}`)
			.attach('submission', testFile)
			.expect(201);
		await request(app)
			.get(`/api/student/submissions/${assigmentId}/download`) // Invalid submissionId
			.set('authorization', `Bearer ${token1}`)
			.expect('Content-Type', /json/)
			.expect(404)
			.expect({ error: 'Submission not found or you do not have permission' });
	});
});


describe('GET api/student/courses', () => {
	test('Successful view enrollments', async () => {
		const {token2} = await generateDbData();
		await request(app)
		.get(`/api/student/courses`)
		.set('authorization', `Bearer ${token2}`)
		.expect('Content-Type', /json/)
		.expect(200)
	});

	test('Empty view enrollments, student is not enrolled and returns empty', async () => {
		const {token1} = await generateDbData();
		const response = await request(app)
		.get(`/api/student/courses`)
		.set('authorization', `Bearer ${token1}`)
		.expect('Content-Type', /json/)
		.expect(200);
		expect(response.body).toEqual([]);
	});

	test('Error view enrollments, failure to authenticate token', async () => {
		await generateDbData();
		await request(app)
		.get(`/api/student/courses`)
		.set('authorization', `Bearer ${'invalid_token'}`)
		.expect('Content-Type', /json/)
		.expect({ message: 'Failed to authenticate token' })
		.expect(403);
	});
})

describe('GET api/student/courses/:courseId', () => {
	test('Successful view course enrollment details', async () => {
		const {token2, courseId} = await generateDbData();
		await request(app)
		.get(`/api/student/courses/${courseId}`)
		.set('authorization', `Bearer ${token2}`)
		.expect('Content-Type', /json/)
		.expect(200)
	});

	test('Error, student is not enrolled', async () => {
		const {token1, courseId} = await generateDbData();
		await request(app)
		.get(`/api/student/courses/${courseId}`)
		.set('authorization', `Bearer ${token1}`)
		.expect('Content-Type', /json/)
		.expect({"error": "Course not found or you are not enrolled in this course"})
		.expect(404);
	});

	test('Error, course doesn\'t exist', async () => {
		const {token2} = await generateDbData();
		await request(app)
		.get(`/api/student/courses/${123987}`) // Invalid course Id
		.set('authorization', `Bearer ${token2}`)
		.expect('Content-Type', /json/)
		.expect({"error": "Course not found or you are not enrolled in this course"})
		.expect(404);
	});
})

// describe('GET api/student/marks', () => {
// 	test('Successful view marks', async () => {
// 		const testFile = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz')
// 		const {token2, assigmentId} = await generateDbData();
// 		const submission = await request(app)
// 			.post(`/api/student/assignments/${assigmentId}/submit`)
// 			.set('authorization', `Bearer ${token2}`)
// 			.attach('submission', testFile)
// 			.expect(201);
// 		const submissionId = submission.body.submissionId;
// 		// MARK SUBMISSION HERE
// 	});
// })

/*
// View specific assignment
router.get('/assignments/:assignmentId/view', viewAssignment);

// View all student assignments
router.get('/assignments', viewAssignments);


*/