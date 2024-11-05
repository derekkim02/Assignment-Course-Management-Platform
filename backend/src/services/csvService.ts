import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../prismaClient';
import { Day, User, Class } from '@prisma/client';
interface SMSCsvRow {
	fullname: string;
	zId: string;
	email: string;
	classId: string;
	className: string;
	startTime: string;
	duration: string;
	day: string;
	tutorId: string;
	tutorName: string;
	tutorEmail: string;
}

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
	if (!fullName) {
		throw new Error(fullName);
	}
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
		const students: User[] = [];
		const tutors: User[] = [];
		const classes: Class[] = [];
		const courseOfferingUpdates: {
			courseOfferingId: number,
			classId: number,
			studentId: number,
			tutorId: number
		}[] = [];

		fs.createReadStream(csvFilePath)
		.pipe(csv())
		.on('data', async (data: SMSCsvRow) => {
			const { firstName, lastName } = splitFullName(data.fullname);
			const { firstName: tutorFirstName, lastName: tutorLastName } = splitFullName(data.tutorName);
			const defaultPassword = 'default_password';
			const studentId = parseInt(data.zId.replace('z', ''), 10);
			const tutorId = parseInt(data.tutorId.replace('z', ''), 10);
			const classId = parseInt(data.classId, 10);
			const duration = parseInt(data.duration, 10);

			students.push({
				zid: studentId,
				firstName,
				lastName,
				email: data.email,
				password: defaultPassword,
				isAdmin: false,
			});

			tutors.push({
				zid: tutorId,
				firstName: tutorFirstName,
				lastName: tutorLastName,
				email: data.tutorEmail,
				password: defaultPassword,
				isAdmin: false,
			});

			classes.push({
				id: classId,
				name: data.className,
				startTime: data.startTime,
				duration: duration,
				day: dayToEnum(data.day),
				tutorId: tutorId,
				courseOfferingId,
			});

			courseOfferingUpdates.push({
				courseOfferingId,
				classId,
				studentId,
				tutorId,
			});
		}).on('end', async () => {
			try {
				await prisma.$transaction([
					prisma.user.createMany({ data: students, skipDuplicates: true }),
					prisma.user.createMany({ data: tutors, skipDuplicates: true }),
					prisma.class.createMany({ data: classes, skipDuplicates: true }),
				]);

				for (const { courseOfferingId, classId, studentId, tutorId } of courseOfferingUpdates) {
					await prisma.class.update({
						where: { id: classId },
						data: {
							students: {
								connect: { zid: studentId },
							},
						},
					});
					await prisma.courseOffering.update({
						where: { id: courseOfferingId },
						data: {
							classes: {
								connect: { id: classId },
							},
							enrolledStudents: {
								connect: { zid: studentId },
							},
							tutors: {
								connect: { zid: tutorId },
							},
						},
					});
				}
			} catch (err) {
				console.error(err);
			}
			
		});
	}
}

export default CsvService;