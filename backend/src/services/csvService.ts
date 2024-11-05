import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../prismaClient';
import { Day } from "@prisma/client"
interface SMSCsvRow {
	fullName: string;
	zid: string;
	email: string;
	classId: number;
	className: string;
	startTime: string;
	duration: number;
	day: string;
	tutorId: string;
	tutorName: string;
	tutorEmail: string;
}

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
	const names = fullName.split(' ');
	return {
		firstName: names[0],
		lastName: names.slice(1).join(' '),
	};
}

const dayToEnum = (day: string): Day => {
	if (day === 'Monday') return Day.Monday;
	if (day === 'Tuesday') return Day.Tuesday;
	if (day === 'Wednesday') return Day.Wednesday;
	if (day === 'Thursday') return Day.Thursday;
	if (day === 'Friday') return Day.Friday;
	if (day === 'Saturday') return Day.Saturday;
	if (day === 'Sunday') return Day.Sunday;
	throw new Error(`Invalid day: ${day}`);
}

class CsvService {
	public static async importSMSCsvToDbForCourseOffering(csvFilePath: string, courseOfferingId: number): Promise<void> {
		fs.createReadStream(csvFilePath).pipe(csv()).on('data', async (data: SMSCsvRow) => {
			const { firstName, lastName } = splitFullName(data.fullName);
			const { firstName: tutorFirstName, lastName: tutorLastName } = splitFullName(data.tutorName);
			const defaultPassword = 'default_password';
			const studentId = parseInt(data.zid.replace('z', ''), 10);
			const tutorId = parseInt(data.tutorId.replace('z', ''), 10);

			try {
				const student = await prisma.user.upsert({
					where: { zid: studentId },
					update: {},
					create: {
						zid: studentId,
						firstName,
						lastName,
						email: data.email,
						password: defaultPassword,
					},
				});

				const tutor = await prisma.user.upsert({
					where: { zid: tutorId },
					update: {},
					create: {
						zid: tutorId,
						firstName: tutorFirstName,
						lastName: tutorLastName,
						email: data.tutorEmail,
						password: defaultPassword,
					},
				});

				const classOffering = await prisma.class.upsert({
					where: { id: data.classId },
					update: {
						students: {
							connect: { zid: student.zid },
						},
					},
					create: {
						id: data.classId,
						name: data.className,
						startTime: data.startTime,
						duration: data.duration,
						day: dayToEnum(data.day),
						tutorId: tutor.zid,
						courseOfferingId,
						students: {
							connect: { zid: student.zid },
						},
					},
				});

				await prisma.courseOffering.update({
					where: { id: courseOfferingId },
					data: {
						classes: {
							connect: { id: classOffering.id },
						},
						enrolledStudents: {
							connect: { zid: student.zid },
						},
						tutors: {
							connect: { zid: tutor.zid },
						},
					},
				});

			} catch (error) {
				console.error(error);
			}
		});
	}
}

export default CsvService;