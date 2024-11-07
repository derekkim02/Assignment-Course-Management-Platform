import {beforeEach, describe, expect, test} from '@jest/globals';
import { resetDatabase } from '../utils';
import request from 'supertest';
import app from '../../app';

beforeEach(async () => {
	await resetDatabase();
});

const generateDbData = async (): Promise<{token1: string, token2: string, assigmentId: number, groupAssignmentId: number, courseId: number, courseOfferingId: number}> => {
	// Registers 2 users
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

	const token1 = user1.body.token;
	const token2 = user2.body.token;

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
			tutorsIds: [zid1],
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
			defaultShCmd: 'python3 main.py'
		}).expect(201);

	const groupAssignment = await request(app)
	.post(`/api/lecturer/courses/${courseOffering.body.id}/assignments`)
	.set('authorization', `Bearer ${token1}`)
	.send({
		assignmentName: 'Python 3 Example',
		description: 'This is an example assignment for Python 3',
		dueDate: '2024-12-21 20:00',
		isGroupAssignment: true,
		defaultShCmd: 'python3 main.py'
	}).expect(201);

	return {token1, token2, assigmentId: assignment.body.id, groupAssignmentId: groupAssignment.body.id, courseId: course.body.id, courseOfferingId: courseOffering.body.id};
}

describe('GET api/lecturer/courses', () => {
	test('Successful view lectured courses', async () => {
		const {token1} = await generateDbData();
        await request(app)
			.get(`/api/lecturer/courses`)
			.set('authorization', `Bearer ${token1}`)
            .expect('Content-Type', /json/)
			.expect(200);
	});
    test('Empty view enrollments, unauthorized token', async () => {
		const {token2} = await generateDbData();
		const response = await request(app)
		.get(`/api/lecturer/courses`)
		.set('authorization', `Bearer ${token2}`) // token2 is not a lecturer, api call is held by frontend
		.expect('Content-Type', /json/)
		.expect(200);
        expect(response.body).toEqual([]);
	});
})

describe('GET api/lecturer/courses/:courseId', () => {
	test('Successful view lecturer course details', async () => {
		const {token1, courseOfferingId} = await generateDbData();
        await request(app)
			.get(`/api/lecturer/courses/${courseOfferingId}`)
			.set('authorization', `Bearer ${token1}`)
            .expect('Content-Type', /json/)
			.expect(200);
	});
    test('Error view lecturer course details, invalid course', async () => {
		const {token1} = await generateDbData();
        await request(app)
			.get(`/api/lecturer/courses/${123987}`)
			.set('authorization', `Bearer ${token1}`)
            .expect('Content-Type', /json/)
            .expect({ error: 'Course not found or you are not the lecturer for this course' })
			.expect(404);
	});
})

describe('POST api/lecturer/courses/:courseId/assignments', () => {
    test('Successful create assignment', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/courses/${courseOfferingId}/assignments`)
		.set('authorization', `Bearer ${token1}`)
		.send({
			assignmentName: 'Python 3 Example',
			description: 'This is an example assignment for Python 3',
			dueDate: '2024-11-22 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py'
		})
        .expect('Content-Type', /json/)
        .expect(201);
    });

    test('Error create assignment, missing required field', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/courses/${courseOfferingId}/assignments`)
		.set('authorization', `Bearer ${token1}`)
		.send({
			assignmentName: 'Python 3 Example',
			description: 'This is an example assignment for Python 3',
			dueDate: '2024-11-22 20:00',
			isGroupAssignment: false,
            // Missing shCmd field
		})
        .expect('Content-Type', /json/)
        .expect({ error: 'Missing required fields' })
        .expect(400);
    });

    test('Error create assignment, invalid due date', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/courses/${courseOfferingId}/assignments`)
		.set('authorization', `Bearer ${token1}`)
		.send({
			assignmentName: 'Python 3 Example',
			description: 'This is an example assignment for Python 3',
			dueDate: '1999-110-220 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py'
		})
        .expect('Content-Type', /json/)
        .expect({ error: 'Invalid due date' })
        .expect(400);
    });

    test('Error create assignment, lecturer not assigned to course', async () => {
        const {token2, courseOfferingId} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/courses/${courseOfferingId}/assignments`)
		.set('authorization', `Bearer ${token2}`)
		.send({
			assignmentName: 'Python 3 Example',
			description: 'This is an example assignment for Python 3',
			dueDate: '2024-11-22 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py'
		})
        .expect('Content-Type', /json/)
        .expect({ error: 'Permission error: You are not assigned to this course' })
        .expect(403);
    });
    // Lines not seen by coverage
    // ({ error: 'Lecturer not found' }), token catches this, lecturer email must not exist in db
})

describe('PUT api/lecturer/courses/:courseId/assignments/:assignmentId', () => {
    test('Successful update assignment', async () => {
        const {token1, courseOfferingId, assigmentId} = await generateDbData();
        await request(app)
        .put(`/api/lecturer/courses/${courseOfferingId}/assignments/${assigmentId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({
			assignmentName: 'New python 3 Example',
			description: 'New description',
			dueDate: '2024-11-23 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py'
        })
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('Error update assignment, invalid assignment id', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .put(`/api/lecturer/courses/${courseOfferingId}/assignments/${123987}`)
        .set('authorization', `Bearer ${token1}`)
        .send({
			assignmentName: 'New python 3 Example',
			description: 'New description',
			dueDate: '2024-11-23 20:00',
			isGroupAssignment: false,
			defaultShCmd: 'python3 main.py'
        })
        .expect('Content-Type', /json/)
        .expect({ error: 'Assignment not found or does not belong to this course' })
        .expect(404);
    });
})

describe('DELETE api/lecturer/courses/:courseId/assignments/:assignmentId', () => {
    test('Successful delete assignment', async () => {
        const {token1, courseOfferingId, assigmentId} = await generateDbData();
        await request(app)
        .delete(`/api/lecturer/courses/${courseOfferingId}/assignments/${assigmentId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect({ message: 'Assignment deleted' })
        .expect(200);
    });

    test('Error delete assignment, incorrect assignment id', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .delete(`/api/lecturer/courses/${courseOfferingId}/assignments/${123987}`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect({ error: 'Assignment not found' })
        .expect(404);
    });
})

describe('GET api/lecturer/courses/:courseId/assignments/:assignmentId/view', () => {
    test('Successful view assignment', async () => {
        const {token1, courseOfferingId, assigmentId} = await generateDbData();
        await request(app)
        .get(`/api/lecturer/courses/${courseOfferingId}/assignments/${assigmentId}/view`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('Error view assignment, assignment id invalid', async () => {
        const {token1, courseOfferingId} = await generateDbData();
        await request(app)
        .get(`/api/lecturer/courses/${courseOfferingId}/assignments/${123987}/view`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect({ error: 'Assignment not found' })
        .expect(404);
    });
})

describe('POST api/lecturer/assignments/:assignmentId/mark', () => {
    test('Successful mark assignment', async () => {
        const {token1, assigmentId} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/assignments/${assigmentId}/mark`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect({ message: 'Submissions marked' })
        .expect(200);
    });

    test('Error mark assignment, assignment not found', async () => {
        const {token1} = await generateDbData();
        await request(app)
        .post(`/api/lecturer/assignments/${123987}/mark`)
        .set('authorization', `Bearer ${token1}`)
        .expect('Content-Type', /json/)
        .expect({ error: 'Assignment not found or you are not the lecturer for this course' })
        .expect(404);
    });
})

/*
// Search for students in a specific course
router.get('/students', getStudentsInCourse);

// Look at student details
router.get('/students/:studentId', searchStudentById);
*/

/*
// Create test case for an assignment
router.post('/courses/:courseId/assignments/:assignmentId/testcases', createTest);

// View a submission's content
router.get('/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/view', viewSubmission);
*/