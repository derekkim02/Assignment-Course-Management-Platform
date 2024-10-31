import {describe, expect, beforeAll, afterEach, afterAll, it} from '@jest/globals';
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

describe('POST api/student/assignments/:assignmentId/submit', () => {
	const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');

	it('should fail because the assignment does not exist', async () => {
		const response = await request(app)
			.post('/api/student/assignments/123/submit')
			.attach('python3example', py3FilePath)
			.expect(401)
			.expect('Content-Type', /json/)
			.expect({ message: 'No token provided' });
	});
});
