import React from 'react';
import { Layout, Row, Col, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Meta } = Card;
const { Title } = Typography;

const courses = [
  { id: 1, name: 'Course 1', description: 'Description for Course 1', term: '24T1' },
  { id: 2, name: 'Course 2', description: 'Description for Course 2', term: '24T2' },
  { id: 3, name: 'Course 3', description: 'Description for Course 3', term: '24T3' },
  { id: 4, name: 'Course 4', description: 'Description for Course 4', term: '24T4' },
  { id: 5, name: 'Course 5', description: 'Description for Course 5', term: '24T1' },
  // Add more courses as needed
];

// Group courses by term
const groupedCourses = courses.reduce((acc, course) => {
  if (!acc[course.term]) {
    acc[course.term] = [];
  }
  acc[course.term].push(course);
  return acc;
}, {} as Record<string, typeof courses>);

const CoursesSection: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        {Object.keys(groupedCourses).map(term => (
          <div key={term}>
            <Title level={2} style={{ textAlign: 'left' }}>{term}</Title>
            <Row gutter={[32, 32]} wrap>
              {groupedCourses[term].map(course => (
                <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                  <Link to={`${course.id}`}>
                    <Card hoverable style={{ marginBottom: '20px' }}>
                      <Meta title={course.name} description={course.description} />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Content>
    </Layout>
  );
};

export default CoursesSection;