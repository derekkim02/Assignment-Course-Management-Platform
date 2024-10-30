declare namespace Express {
	export interface Request {
		// User email in every request
		userEmail?: string;
		submissionInfo?: SubmissionInfo;
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
