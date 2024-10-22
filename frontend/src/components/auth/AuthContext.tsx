import React, { createContext, useContext, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  isIGiveAdmin: boolean;
  userRole: string;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('token'));
  const getIsIGiveAdmin = () => {
    const token = Cookies.get('token');
    if (token) {
      const decodedToken: { email : string, isAdmin: boolean } = jwtDecode(token);
      return decodedToken.isAdmin;
    }
    return false;
  };

  const isIGiveAdmin = getIsIGiveAdmin();
  const [userRole, setRole] = useState('marker');

  const login = (token: string) => {
    const decodedToken: { role: string, exp: number } = jwtDecode(token);
    const expirationDate = new Date(decodedToken.exp * 1000); // Convert exp to milliseconds
    Cookies.set('token', token, { expires: expirationDate });

    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole, isIGiveAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
