import React from 'react';
import { Layout } from 'antd';
import { useEnrollments, useLecturedCourses } from '../../../queries';
import CourseExpandable from './CourseExpandable';

const { Content } = Layout;

const CoursesSection: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <CourseExpandable name='Enrolled Courses' useFetch={useEnrollments} role='student'/>
        <CourseExpandable name='Lecturing Courses' useFetch={useLecturedCourses} role='lecturer'/>
        <CourseExpandable name='Tutoring Courses' useFetch={useLecturedCourses} role='tutor'/>
      </Content>
    </Layout>
  );
};

export default CoursesSection;
