declare namespace Express {
	export interface Request {
		// User email in every request
		userEmail?: string;
		submissionInfo?: SubmissionInfo;
		assignmentData?: assignmentData;
		testData?: testData;
	}
}

interface TestCase {
	input: string;
	expectedOutput: string;
}

interface TestResult {
	passed: boolean;
	message: string;
}

interface SubmissionInfo {
	submitterId: number;
	shCmd: string;
	testCases: TestCase[];
}

interface assignmentData {
		assignmentName: string;
		description: string;
		dueDate: Date;
		isGroupAssignment: boolean;
		courseOfferingId: number;
		defaultShCmd: string;
		assignmentId?: number; // Include assignmentId when updating
	};
