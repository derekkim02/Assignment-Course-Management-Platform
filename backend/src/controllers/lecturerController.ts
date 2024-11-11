import { Request, Response } from "express";
import prisma from '../prismaClient';
import AutotestService from "../services/autotestService";
import LatePenaltyService from "../services/latepenaltyService";

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.assignmentData) {
      res.status(500).json({ error: 'Missing assignment data' });
      return;
    }

    const {
      assignmentName,
      description,
      dueDate,
      isGroupAssignment,
      courseOfferingId,
      defaultShCmd,
    } = req.assignmentData;

    const newAssignment = await prisma.assignment.create({
      data: {
        name: assignmentName,
        description: description,
        dueDate: dueDate,
        isGroupAssignment: isGroupAssignment,
        autoTestExecutable: '',
        courseOfferingId: courseOfferingId,
        defaultShCmd: defaultShCmd,
        submissions: {
          create: [],
        },
        testCases: {
          create: [],
        },
      },
    });

    res.status(201).json(newAssignment);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.assignmentData) {
      res.status(500).json({ error: 'Missing assignment data' });
      return;
    }

    const {
      assignmentName,
      description,
      dueDate,
      isGroupAssignment,
      assignmentId,
    } = req.assignmentData;

    if (!assignmentId) {
      res.status(400).json({ error: 'Assignment ID is required for updating' });
      return;
    }

    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        name: assignmentName,
        description: description,
        dueDate: dueDate,
        isGroupAssignment: isGroupAssignment,
      },
    });

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const viewAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        testCases: true,
        submissions: true,
      },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.status(200).json(assignment);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);

    await prisma.assignment.delete({
      where: {
        id: assignmentId,
      },
    });

    res.status(200).json({ message: 'Assignment deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createTest = async (req: Request, res: Response): Promise<void> => {
	try {
    const assignmentId = parseInt(req.params.assignmentId);
    const { input, output, isHidden } = req.body;

    // Sanitize and validate inputs
    if (!input || !output || typeof isHidden !== 'boolean') {
      throw new Error("Invalid input or outputs");
    }

    // Create the test case
    const testCase = await prisma.testCase.create({
      data: {
        input: input,
        expectedOutput: output,
        assignmentId: assignmentId,
        isHidden: isHidden,
      }
    });
	  res.status(201).json(testCase);
	} catch (error) {
	  res.status(400).json({ error: (error as Error).message });
	}
}

export const viewAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const response = assignment.submissions.map(submission => ({
      submissionId: submission.id,
      submitterId: assignment.isGroupAssignment ? submission.groupId : submission.studentId,
      submissionTime: submission.submissionTime,
      autoMarkResult: submission.autoMarkResult,
      latePenalty: submission.latePenalty,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export const viewSubmission =  async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.body;
    const submission = await prisma.submission.findUnique({where: {id: parseInt(submissionId)}});

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    res.status(200).json(submission);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export const getStudentsInCourse =  async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, termYear, termTerm } = req.body;
    const courseOffering = await prisma.courseOffering.findUnique({
      where: {
        courseId_termYear_termTerm: {
          courseId: courseId,
          termYear: termYear,
          termTerm: termTerm,
        },
      },
      include: {
        enrolledStudents: true,
      },
    });

    if (!courseOffering) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.status(200).json(courseOffering.enrolledStudents);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export const searchStudentById =  async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;
    const student = await prisma.user.findUnique({
      where: {
      zid: studentId,
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export const viewLecturedCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.user.findUnique({
      where: {
        email: req.userEmail
      },
      include: {
        coursesLectured: {
          include: {
            course: true,
            term: true,
          }
        }
      }
    })

    if (!data) {
      res.status(404).json({ error: 'User\'s data does not exist' });
      return;
    }

    const response = data.coursesLectured.map(enrolment => ({
			enrolmentId: enrolment.id,
			courseName: enrolment.course.name,
			courseCode: enrolment.course.code,
			courseDescription: enrolment.course.description,
			term: enrolment.termTerm,
			year: enrolment.termYear,
		}));

    res.status(200).json(response);
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

export const viewLecturedCourseDetails = async (req: Request, res: Response): Promise<void> => {
	try {
		const courseEnrollmentId = parseInt(req.params.courseId);
		const data = await prisma.courseOffering.findUnique({
			where: {
				id: courseEnrollmentId,
        lecturer: {
          email: req.userEmail
        }
			},
			include: {
				term: true,
				course: true,
				assignments: true,
        enrolledStudents: true,
			}
		});

    if (!data) {
      res.status(404).json({ error: 'Course not found or you are not the lecturer for this course' });
      return;
    }

    const response = {
			enrollmentId: data.id,
			courseName: data.course.name,
			courseCode: data.course.code,
			courseDescription: data.course.description,
			term: data.term.term,
			year: data.term.year,
			assignments: data.assignments.map(assignment => ({
				assignmentId: assignment.id,
				assignmentName: assignment.name,
				description: assignment.description,
				dueDate: assignment.dueDate,
				isGroupAssignment: assignment.isGroupAssignment,
				defaultShCmd: assignment.defaultShCmd,
			})),
      enrolledStudents: data.enrolledStudents.map(student => ({
        zid: student.zid,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      })),
		}

    res.status(200).json(response);
	} catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
	}
}

export const markAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);

    const data = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        courseOffering: {
          lecturer: {
            email: req.userEmail
          }
        }
      },
      include: {
        submissions: true,
        testCases: true,
        courseOffering: true,
      },
    });

    if (!data) {
      res.status(404).json({ error: 'Assignment not found or you are not the lecturer for this course' });
      return;
    }

    const latestSubmissions = data.submissions.reduce((acc, submission) => {
      const submitterId = data.isGroupAssignment ? submission.groupId : submission.studentId;
      const existingSubmission = acc.find(s => (data.isGroupAssignment ? s.groupId : s.studentId) === submitterId);

      if (!existingSubmission || submission.submissionTime > existingSubmission.submissionTime) {
        acc.filter(s => data.isGroupAssignment ? s.groupId : s.studentId !== submitterId);
        acc.push(submission);
      }

      return acc;
    }, [] as typeof data.submissions);


    const testCases = data.testCases.map(testCase => ({ input: testCase.input, expectedOutput: testCase.expectedOutput }));
    const shellCommand = data.defaultShCmd;
    const penaltyStrategy = data.courseOffering.penaltyStrategy;

    await Promise.all(latestSubmissions.map(async submission => {
      const submitterId = data.isGroupAssignment ? submission.groupId : submission.studentId;
      if (!submitterId) {
        return;
      }

      const autotestService = new AutotestService(testCases, shellCommand, submission.filePath);

      const extraDays = data.isGroupAssignment ? await LatePenaltyService.getExtraDaysGroup(submitterId, data.dueDate)
      : await LatePenaltyService.getExtraDaysIndividual(submitterId, data.dueDate);

      const latepenaltyService = new LatePenaltyService(data.dueDate, submission.submissionTime, penaltyStrategy , extraDays);

      autotestService.runTests().then((results) => {
        const score = results.length === 0 ? results.filter(result => result.passed).length / results.length : 100;

        prisma.submission.update({
          where: {
            id: submission.id,
          },
          data: {
            autoMarkResult: score,
            latePenalty: latepenaltyService.getLatePenalty(),
          },
        });
      });
    }));

    res.status(200).json({ message: 'Submissions marked' });
  } catch {
    res.status(500).json({ error: 'Failed to mark submissions' });
  }
}

export const downloadStudentSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.submissionId);

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    res.download(submission.filePath);
  } catch {
    res.status(500).json({ error: 'Failed to download submission' });
  }
}