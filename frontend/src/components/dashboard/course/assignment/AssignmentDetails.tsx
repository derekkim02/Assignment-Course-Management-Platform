import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Card } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  date: string;
  grade: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  feedback: string;
  submissions: Submission[];
}

const AssignmentDetails: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  // Dummy data for assignment details
  const assignment: Assignment = {
    id: Number(assignmentId),
    title: `Assignment ${assignmentId}`,
    description: `This is the detailed description for Assignment ${assignmentId}.`,
    dueDate: '2023-10-01',
    feedback: 'Overall great job on this assignment!',
    submissions: [
      { id: 1, date: '2023-09-15', grade: 'A' },
      { id: 2, date: '2023-09-20', grade: 'B+' },
    ],
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>{assignment.title}</Title>
        <Paragraph>{assignment.description}</Paragraph>
        <Paragraph>Due Date: {assignment.dueDate}</Paragraph>
        <Title level={3}>Overall Feedback</Title>
        <Paragraph>{assignment.feedback}</Paragraph>
        <Title level={3}>Past Submissions</Title>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={assignment.submissions}
          renderItem={submission => (
            <List.Item>
              <Card title={`Submission ${submission.id}`}>
                <p>Date: {submission.date}</p>
                <p>Grade: {submission.grade}</p>
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default AssignmentDetails;