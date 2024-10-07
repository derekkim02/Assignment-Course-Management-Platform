import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../auth/LoginPage';
import { useAuth } from '../auth/AuthContext';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<About/>}/>}/>
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login"/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;