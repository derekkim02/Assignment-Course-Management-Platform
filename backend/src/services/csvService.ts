import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../prismaClient';

interface SMSCsvRow {
	
}

class CsvService {
	public static async importSMSCsvToDb(csvFilePath: string): Promise<void> {
		fs.createReadStream(csvFilePath).pipe(csv()).on('data', async (data: SMSCsvRow) => {
		
		});
	}
}