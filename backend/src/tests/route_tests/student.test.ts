import {describe, expect, beforeAll, afterEach, afterAll, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeAll(async () => {
	await resetDatabase();
});
const generateDbData = async (): Promise<void> => {
	const user1RegData = {
		firstName: 'user', 
		lastName: '1',
		email: 'user1@gmail.com',
		password: 'bananas',
		cpassword: 'bananas'
	};
	const user2RegData = {
		firstName: 'user', 
		lastName: '2',
		email: 'user2@gmail.com',
		password: 'bananas',
		cpassword: 'bananas'
	};

	// Register a user, should be admin since db is fresh
	await request(app)
		.post('/api/auth/register')
		.send(user1RegData)
		.expect(201);
	// Register student user
	await request(app)
		.post('/api/auth/register')
		.send(user2RegData)
		.expect(201);

	// Get the token by logging in
	const login1 = {
		email: user1RegData.email,
		password: user1RegData.password
	}
	const login2 = {
		email: user2RegData.email,
		password: user2RegData.password
	}
	const user1 = await request(app)
		.post('/api/auth/login')
		.send(login1)
		.expect(200);
	const user2 = await request(app)
		.post('/api/auth/login')
		.send(login2)
		.expect(200);

	const token1 = user1.body.token;
	const token2 = user2.body.token;

	// Create a course
	const courseData = {
		name: 'Programming Fundamentals',
		code: 'Comp1511',
		description: 'This course is an introductory course to the basics of Computer Programming and Computer Science. ' +
		             'It is intended as an introduction to studying further in Computer Science or related fields.'
	}

	// Admin creates a course
	const course = await request(app)
		.post('/api/admin/courses')
		.set('authorization', `Bearer ${token1}`)
		.send(courseData)
		.expect(201);
	
	// Admin creates a course offering
	const courseOfferingData = {
		courseId: course.body.id,
		termYear: 2024,
		termTerm: 1,
		lecturerId: user1.body.id
	}
	await request(app)
		.post('/api/admin/course-offerings')
		.set('authorization', `Bearer ${token1}`)
		.send(courseOfferingData)
		.expect(201);
	
	// Admin creates an assignment
	const assignmentData = {
		courseId: course.body.id,
		title: 'Python 3 Example',
		description: 'This is an example assignment for Python 3',
		maxMark: 10,
		dueDate: new Date(),
	}
	
}

describe('POST api/student/assignments/:assignmentId/submit', () => {
	const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');
	test('Submit Assignment', async () => {
		// Create an assignment

		const response = await request(app)
			.post('/api/student/assignments/123/submit')
			.attach('python3example', py3FilePath)
			.expect(401)
			.expect('Content-Type', /json/)
			.expect({ message: 'No token provided' });
	});
});
