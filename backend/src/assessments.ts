import {getData, setData } from './datastore';
import { Assignment } from './types';

/*
Example assessment:

const newAssignment: Assignment = {
    assignment_id: 1,
    course_id: 'CS101',
    assignment_name: 'Assignment 1',
    term_id: 'fall2023',
    due_date: new Date('2023-12-01T23:59:59')
};

*/
function createAssessment(assignmentName: string, courseId: string, termId: string, dueDate: string) {
  const data = getData();

  let assignmentId: number;
  assignmentId = Math.floor(Math.random() * 1000); // Random 4 digit assignment ID
  const newAssignment: Assignment = {
    assignmentId: assignmentId,
    assignmentName: assignmentName,
    courseId: courseId,
    termId: termId,
    dueDate: new Date(dueDate)
  }

  
  data.assignments[assignmentId] = newAssignment;
  setData(data);
}