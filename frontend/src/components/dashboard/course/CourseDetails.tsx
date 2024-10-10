import React, { useState, useEffect } from 'react';
import { Layout, Typography, List, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
}

const CourseDetails: React.FC = () => {
  const [courseName, setCourseName] = useState<string>('Dummy Course Name');
  const [courseDescription, setCourseDescription] = useState<string>('This is a brief description of the dummy course.');
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: 'Assignment 1', dueDate: '2023-10-01' },
    { id: 2, title: 'Assignment 2', dueDate: '2023-11-01' },
    { id: 3, title: 'Assignment 3', dueDate: '2023-12-01' },
  ]);

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>{courseName}</Title>
        <Paragraph>{courseDescription}</Paragraph>
        <Title level={3}>Assignments</Title>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={assignments}
          renderItem={assignment => (
            <List.Item>
              <Link to={`assignments/${assignment.id}`}>
                <Card title={assignment.title} hoverable>
                  <p>Due Date: {assignment.dueDate}</p>
                </Card>
              </Link>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default CourseDetails;