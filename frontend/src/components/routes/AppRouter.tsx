import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../auth/LoginPage';
import { useAuth } from '../auth/AuthContext';
import Dasbhoard from '../dashboard/student/Dashboard';
import CalendarSection from '../dashboard/CalendarSection';
import CoursesSection from '../dashboard/course/CoursesSection';
import RecentSubmissions from '../dashboard/student/RecentSubmissions';
import CourseDetails from '../dashboard/course/CourseDetails';
import AssignmentDetails from '../dashboard/course/assignment/AssignmentDetails';
import StudentList from '../dashboard/marker/StudentList';

const About = () => <div>About Page</div>;

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<About/>}/>}/>
        <Route path="/dashboard/calendar" element={<ProtectedRoute element={<Dasbhoard content={<CalendarSection/>}/>}/>}/>
        <Route path="/dashboard/courses" element={<ProtectedRoute element={<Dasbhoard content={<CoursesSection/>}/>}/>}/>
        <Route path="/dashboard/courses/:courseId" element={<ProtectedRoute element={<Dasbhoard content={<CourseDetails />}/>}/>}/>
        <Route path="/dashboard/courses/:courseId/assignments/:assignmentId" element={<Dasbhoard content={<AssignmentDetails/>}/>}/>
        <Route path="/dashboard/submissions" element={<ProtectedRoute element={<Dasbhoard content={<RecentSubmissions/>}/>}/>}/>
        <Route path="/dashboard/student-list" element={<ProtectedRoute role='marker' element={<Dasbhoard content={<StudentList/>}/>}/>}/>
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard/courses"/> : <Navigate to="/login"/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
