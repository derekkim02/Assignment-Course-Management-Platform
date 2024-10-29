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

interface SubmissionInfo {
	zid: number;
	shCmd: string;
	testCases: TestCase[];
}
