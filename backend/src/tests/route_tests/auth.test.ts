import { describe, it, beforeEach } from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';

beforeEach(async () => {
	await resetDatabase();
});

describe('POST api/auth/login', () => {
	it('Login success', async () => {
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
		.post('/api/auth/login')
		.send({
			email: 'user1@gmail.com',
			password: 'bananas',
		}).expect(200);
	});

	it('Error due to invalid password', async () => {
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
		.post('/api/auth/login')
		.send({
			email: 'user1@gmail.com',
			password: 'apples',
		})
		.expect(400)
		.expect('Content-Type', /json/)
		.expect({ error: 'Invalid email or password' });
	});

	it('Error if password =/ cpassword', async () => {
		await request(app)
		.post('/api/auth/register')
		.send({
			firstName: 'user',
			lastName: '1',
			email: 'user1@gmail.com',
			password: 'bananas',
			cpassword: 'apples'
		})
		.expect(400)
		.expect('Content-Type', /json/)
		.expect({ error: 'Passwords do not match' });
	});

	it('Error because user does not exist', async () => {
		await request(app)
			.post('/api/auth/login')
			.send({ email: ' ', password: ' ' })
			.expect(400)
			.expect('Content-Type', /json/)
			.expect({ error: 'Invalid email or password' });
	});
});

