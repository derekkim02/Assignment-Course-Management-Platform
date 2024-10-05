/* Internal type definitions */

type UserRole = 'student' | 'lecturer' | 'admin';

interface User {
    zid: number;
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    password_hash: string;
}

interface ELSAccomodation {
    student_id: number;
    extra_time: number;
}

interface Course {
    course_id: number;
    course_name: string;
    course_code: string;
    course_description: string;
}

interface Assignment {
    assignment_id: number;
    course_id: string;
    assignment_name: string;
    term_id: string;
    due_date: Date;
}

interface TestCase {
    testcase_id: number;
    assignment_id: string;
    file_path: string;
}

interface Term {
    term_id: string;
    year: number;
    term: 'fall' | 'spring' | 'summer'; // Assuming enum for terms
}

interface Lectures {
    lecturer_id: number;
    course_id: number;
    term_id: number;
}

interface Group {
    group_id: number;
    group_name: string;
    group_size: number;
    assignment_id: string;
}

interface InGroup {
    group_id: number;
    student_id: number;
}

interface Submission {
    submission_id: number;
    group_id: number;
    submission_time: Date;
    file_path: string;
    late_penalty: number;
}

interface Grade {
    marker_id: number;
    submission_id: string;
    mark: number;
    marker_comments: string;
    is_marked: boolean;
}

export interface DataStore {
  users: Record<number, User>;
  accommodations: Record<number, ELSAccomodation>;
  courses: Record<number, Course>;
  assignments: Record<number, Assignment>;
  testCases: Record<number, TestCase>;
  terms: Record<string, Term>;
  lectures: Record<number, Lectures>;
  groups: Record<number, Group>;
  inGroups: Record<number, InGroup>;
  submissions: Record<number, Submission>;
  grades: Record<number, Grade>;
}