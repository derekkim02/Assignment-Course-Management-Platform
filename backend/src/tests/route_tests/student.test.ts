import {describe, expect, beforeAll, afterEach, afterAll, it} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../server';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeAll(() => {
	resetDatabase();
});

describe('Student Routes', () => {
	describe('POST /assignments/:assignmentId/submit', () => {
		const py3FilePath = path.join(__dirname, '..', 'sample_assignments', 'python3SampleAssignment.tar.gz');

		it('should submit an individual assignment', async () => {
			const response = await request(app)
				.post('/assignments/123/submit')
				.attach('python3example', py3FilePath)
				.expect(200);
		});
	});
});