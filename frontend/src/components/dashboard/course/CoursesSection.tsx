// frontend/src/components/CoursesSection.tsx
import React from 'react';
import { Layout, Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Meta } = Card;

const courses = [
  { id: 1, name: 'Course 1', description: 'Description for Course 1' },
  { id: 2, name: 'Course 2', description: 'Description for Course 2' },
  { id: 3, name: 'Course 3', description: 'Description for Course 3' },
  { id: 4, name: 'Course 4', description: 'Description for Course 4' },
  // Add more courses as needed
];

const CoursesSection: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Row gutter={[16, 16]} wrap>
          {courses.map(course => (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`${course.id}`}>
                <Card hoverable>
                  <Meta title={course.name} description={course.description} />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default CoursesSection;