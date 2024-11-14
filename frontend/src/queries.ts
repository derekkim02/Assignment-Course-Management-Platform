import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { config } from './config';

const fetchWithAuth = async (url: string, queries: { [key: string]: string }) => {
  const token = Cookies.get('token') || '';
  const queryParams = new URLSearchParams(queries).toString();
  const response = await fetch(`${config.backendUrl}/${url}?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchWithAuth('api/admin/users', {})
  });
};

export const useAdminCourseOfferings = () => {
  return useQuery({
    queryKey: ['adminCourseOfferings'],
    queryFn: () => fetchWithAuth('api/admin/course-offerings', {})
  });
};

export const useAdminGetCourseOffering = (courseOfferingId: string) => {
  return useQuery({
    queryKey: ['adminCourseOffering'],
    queryFn: () => fetchWithAuth(`api/admin/course-offerings/${courseOfferingId}`, {})
  });
};

export const useCourses = (role: string) => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchWithAuth('api/admin/courses', { role })
  });
};

export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => fetchWithAuth('api/student/courses', {})
  });
};

export const useLecturedCourses = () => {
  return useQuery({
    queryKey: ['lecturedCourses'],
    queryFn: () => fetchWithAuth('api/lecturer/courses', {})
  });
};

export const useTutoringCourses = () => {
  return useQuery({
    queryKey: ['tutuoringCourses'],
    queryFn: () => fetchWithAuth('api/tutor/courses', {})
  });
};

export const useEnrollment = (role: string, enrolmentId: string) => {
  return useQuery({
    queryKey: ['enrollment', enrolmentId],
    queryFn: () => fetchWithAuth(`api/${role}/courses/${enrolmentId}`, {})
  });
};

export const useAssignment = (role: string, assignmentId: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchWithAuth(`api/${role}/assignments/${assignmentId}`, {})
  });
};

export const useSubmissions = (assignmentId: string) => {
  return useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => fetchWithAuth(`api/tutor/assignments/${assignmentId}/submissions`, {})
  });
};

export const useMarks = () => {
  return useQuery({
    queryKey: ['marks'],
    queryFn: () => fetchWithAuth('api/student/marks', {})
  });
};
