import { useQuery } from 'react-query';

const fetchWithAuth = async (url: string, token: string, role: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Role': role,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useUsers = (token: string, role: string) => {
  return useQuery('users', () => fetchWithAuth('/api/users', token, role));
};

export const useCourses = (token: string, role: string) => {
  return useQuery('courses', () => fetchWithAuth('/api/courses', token, role));
};