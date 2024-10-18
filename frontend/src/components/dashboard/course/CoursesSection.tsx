import React from 'react';
import { Layout, Row, Col, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useCourses } from '../../../queries';

const { Content } = Layout;
const { Meta } = Card;
const { Title } = Typography;

// Group courses by term
// const groupedCourses = courses.reduce((acc, course) => {
//   if (!acc[course.term]) {
//     acc[course.term] = [];
//   }
//   acc[course.term].push(course);
//   return acc;
// }, {} as Record<string, typeof courses>);

const CoursesSection: React.FC = () => {
  const { data: courses, isLoading, error } = useCourses('marker');
  console.log(courses);

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        {/* {Object.keys(groupedCourses).map(term => (
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
        ))} */}
      </Content>
    </Layout>
  );
};

export default CoursesSection;
