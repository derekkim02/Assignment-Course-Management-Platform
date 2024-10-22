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

export const useUsers = (role: string) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchWithAuth('api/users', { role })
  });
};

export const useCourses = (role: string) => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchWithAuth('api/admin/courses', { role })
  });
};

export const useEnrollments = (role: string) => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => fetchWithAuth('api/enrollments', { role })
  });
};

export const useEnrollment = (enrollmentId: string) => {
  return useQuery({
    queryKey: ['course', enrollmentId],
    queryFn: () => fetchWithAuth(`api/enrollments/${enrollmentId}`, {})
  });
};
