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