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

export const useMarkingCourses = () => {
  return useQuery({
    queryKey: ['markingCourses'],
    queryFn: () => fetchWithAuth('api/enrollments', {})
  });
};

export const useEnrollment = (role: string, enrolmentId: string) => {
  return useQuery({
    queryKey: ['course', enrolmentId],
    queryFn: () => fetchWithAuth(`api/${role}/courses/${enrolmentId}`, {})
  });
};
