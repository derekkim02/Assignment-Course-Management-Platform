import {describe, expect, beforeAll, afterEach, afterAll, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../server';
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

	// Register a user, should be admin since db is fresh
	await request(app)
		.post('/api/auth/register')
		.send(user1RegData)
		.expect(201);

	// Get the token by logging in
	const loginData = {
		email: user1RegData.email,
		password: user1RegData.password
	}
	const loginResponse = await request(app)
		.post('/api/auth/login')
		.send(loginData)
		.expect(200);
	const token = loginResponse.body.token;
	
	// Create a course
	const courseData = {
		name: 'Programming Fundamentals',
		code: 'Comp1511',
		description: 'This course is an introductory course to the basics of Computer Programming and Computer Science. ' +
		             'It is intended as an introduction to studying further in Computer Science or related fields.'
	}
	await request(app)
		.post('/api/admin/courses')
		.set('authorization', `Bearer ${token}`)
		.send(courseData)
		.expect(201);
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
