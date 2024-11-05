import { describe, beforeAll, test, expect } from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../server';
import { fileURLToPath } from 'url';
import path from 'path';

beforeAll(async () => {
	await resetDatabase();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const class1 = path.join(__dirname, '..', 'sample_csv', 'class1.csv');

describe('POST api/auth/login', () => {
	test('import from csv', async () => {
		await request(app).post('/api/auth/register')
			.send({ 
				'firstName': 'John',
				'lastName': 'Doe',
				'email': 'johndoe@gmail.com',
				'password': 'password123',
				'cpassword': 'password123'
			}).expect(201);

		const response = await request(app).post('/api/auth/login')
			.send({ 
				'email': 'johndoe@gmail.com',
				'password': 'password123'
			}).expect(200);
		
		const token = response.body.token;

		const course = await request(app).post('/api/admin/courses')
			.set('Authorization', `Bearer ${token}`)
			.send({
				'name': 'Programming Fundamentals',
				'code': 'COMP1511',
				'description': 'Introduction to programming'
			}).expect(201);

		await request(app).post('/api/admin/course-offerings')
			.set('Authorization', `Bearer ${token}`)
			.send({
				'lecturerId': '1',
				'courseId': course.body.id,
				'termYear': 2024,
				'termTerm': 1
			}).expect(201);
		
		request(app).post('/api/admin/course-offerings/1/import-csv')
			.set('Authorization', `Bearer ${token}`)
			.attach('csv', class1)
			.expect(201);
		
		const courseOffering = await request(app).get('/api/admin/course-offerings/1')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(courseOffering.body.students.length).toBe(212);
	});
});