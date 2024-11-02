import React from 'react';
import { Collapse, Layout } from 'antd';
import { useEnrollments, useLecturedCourses } from '../../../queries';
import CourseExpandable from './CourseExpandable';

const { Content } = Layout;
const { Panel } = Collapse;

const CoursesSection: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <CourseExpandable name='Enrolled Courses' useFetch={useEnrollments} role='student'/>
        <CourseExpandable name='Lecturing Courses' useFetch={useLecturedCourses} role='lecturer'/>
      </Content>
    </Layout>
  );
};

export default CoursesSection;
