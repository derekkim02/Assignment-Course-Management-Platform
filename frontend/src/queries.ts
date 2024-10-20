import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { config } from './config';

const fetchWithAuth = async (url: string, token: string, role: string) => {
  const response = await fetch(`${config.backendUrl}/${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Role: role
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useUsers = (token: string, role: string) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchWithAuth('api/users', token, role)
  });
};

export const useCourses = (role: string) => {
  const token = Cookies.get('token') || '';
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchWithAuth('api/courses', token, role)
  });
};

export const useEnrollments = (role: string) => {
  const token = Cookies.get('token') || '';
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchWithAuth('api/enrollments', token, role)
  });
};
