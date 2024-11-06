import { describe, beforeAll, it } from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';

beforeAll(async () => {
	await resetDatabase();
});

describe('POST api/auth/login', () => {
	it('should fail because the user does not exist', async () => {
		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: ' ', password: ' ' })
			.expect(400)
			.expect('Content-Type', /json/)
			.expect({ error: 'Invalid email or password' });
	});
});

