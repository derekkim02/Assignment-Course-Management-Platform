import React, { useState } from 'react';
import { Layout, Typography, List, Button, Spin, Empty } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEnrollment } from '../../../queries';
import { format } from 'date-fns';
import { bannerStyle, footerLineStyle, listContainerStyle } from './styles';
import AssignmentModal from './AssignmentModal';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Assignment {
  assignmentId: number;
  assignmentName: string;
  dueDate: string;
  description: string;
  assignmentDescription: string;
}

const CourseDetails: React.FC = () => {
  const { role, enrolmentId } = useParams<{ role: string, enrolmentId: string }>();

  const { data: enrollment, isLoading: isLoadingCourses, error, refetch: refetchCourse } = useEnrollment(role || '', enrolmentId || '');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const showModal = () => setIsModalVisible(true);

  if (isLoadingCourses) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2}>Error</Title>
          <Paragraph>There was an error loading the course details. Please try again later.</Paragraph>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: '20px' }}>
      <div style={bannerStyle}>
        <div style={{ paddingTop: '10px', paddingLeft: '25px' }}>
          <Title level={1} style={{ textAlign: 'left' }}>{enrollment.courseCode}</Title>
          <Title level={3} style={{ textAlign: 'left' }}>{enrollment.courseName}</Title>
        </div>

          <div style={footerLineStyle}/>
          <Paragraph style={{ color: '#A3A3A3' }}>{enrollment.courseDescription}</Paragraph>

        {role === 'lecturer' && (
          <>
            <div style={footerLineStyle}/>
            <Button type="primary" onClick={showModal} style={{ alignSelf: 'left', width: '150px', marginBottom: '20px' }}>
              Create Assignment
            </Button>
          </>
        )}
      </div>

      <Title level={3}>Assignments</Title>
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', padding: '30px', borderRadius: '10px' }}>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{
              pageSize: 3,
            }}
            locale={{
              emptyText: (
                <Empty description="No assignments have been released yet." />
              ),
            }}
            dataSource={enrollment.assignments}
            renderItem={(assignment: Assignment) => (
              <List.Item
              key={assignment.assignmentId}
              >
                <Link to={`assignments/${assignment.assignmentId}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <List.Item.Meta
                    title={assignment.assignmentName}
                    description={`${assignment.description || assignment.assignmentDescription}`}
                  />
                  Due Date: {format(new Date(assignment.dueDate), 'HH:mm dd/MM/yyyy')}
                </Link>
              </List.Item>
            )}
          />
        </div>
      </div>
      <AssignmentModal
        isModalVisible={isModalVisible}
        closeModal={() => setIsModalVisible(false)}
        refetch={refetchCourse}
        enrolmentId={enrolmentId || ''}
      />
    </Layout>
  );
};

export default CourseDetails;
