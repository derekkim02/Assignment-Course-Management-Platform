/* Internal type definitions */

type UserRole = 'student' | 'lecturer' | 'admin';

interface User {
    zid: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    passwordHash: string;
}

interface ELSAccommodation {
    studentId: number;
    extraTime: number;
}

interface Course {
    courseId: number;
    courseName: string;
    courseCode: string;
    courseDescription: string;
}

export interface Assignment {
    assignmentId: number;
    courseId: string;
    assignmentName: string;
    termId: string;
    dueDate: Date;
}

interface TestCase {
    testCaseId: number;
    assignmentId: string;
    filePath: string;
}

interface Term {
    termId: string;
    year: number;
    term: 'fall' | 'spring' | 'summer'; // Assuming enum for terms
}

interface Lecture {
    lecturerId: number;
    courseId: number;
    termId: number;
}

interface Group {
    groupId: number;
    groupName: string;
    groupSize: number;
    assignmentId: string;
}

interface InGroup {
    groupId: number;
    studentId: number;
}

interface Submission {
    submissionId: number;
    groupId: number;
    submissionTime: Date;
    filePath: string;
    latePenalty: number;
}

interface Grade {
    markerId: number;
    submissionId: string;
    mark: number;
    markerComments: string;
    isMarked: boolean;
}
