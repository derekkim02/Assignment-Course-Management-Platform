import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import CsvService from '../services/csvService';
import prisma from 'prismaClient';
import { Trimester } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvPath = path.join(__dirname, 'sampleclass.csv');
const o = await prisma.courseOffering.create({
	data: {
		term: {
			create: {
				year: 2021,
				term: Trimester.T1,
			},
		},
		course: {
			create: {
				name: 'COMP1531',
				code: 'COMP1531',
				description: 'Software Engineering Fundamentals',
			},
		},
		lecturer: {
			create: {
				firstName: 'derek',
				lastName: 'kim',
				email: 'derek',
				password: 'kim',
				isAdmin: true,
			},
		}
	}
});
await CsvService.importSMSCsvToDbForCourseOffering(csvPath, o.id);