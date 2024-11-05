import {describe, expect, beforeAll, afterEach, afterAll, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';
import { fileURLToPath } from 'url';
import path from 'path';
import { t } from 'tar';
import exp from 'constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeAll(async () => {
	await resetDatabase();
});
const generateDbData = async (): Promise<{token1: string, token2: string, assigmentId: number}> => {
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
			defaultShCmd: 'python3 main.py'
		}).expect(201);

	return {token1, token2, assigmentId: assignment.body.id};
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
})
