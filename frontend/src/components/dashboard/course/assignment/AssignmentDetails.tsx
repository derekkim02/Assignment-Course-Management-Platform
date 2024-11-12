import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Button, Spin, Skeleton, message } from 'antd';
import dayjs from 'dayjs';
import { bannerStyle, footerLineStyle, listContainerStyle } from '../styles';
import { useAssignment } from '../../../../queries';
import { format } from 'date-fns';
import UploadSubmissionModal from './UploadSubmissionModal';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import EditAssignmentModal from './EditAssignmentModal';
import AutotestModal from './AutotestModal';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  submissionTime: string;
}

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const AssignmentDetails: React.FC = () => {
  const { role, enrolmentId, assignmentId } = useParams<{ role: string, enrolmentId: string, assignmentId: string }>();
  const { data: assignment, isLoading: isAssignmentLoading, error, refetch: refetchAssignment } = useAssignment(role || '', assignmentId || '');
  const token = Cookies.get('token') || '';
  const [openModal, setOpenModal] = useState<string>('');
  const [currentTestCaseId, setCurrentTestCaseId] = useState<string>('');

  const downloadSubmission = async (submissionId: number) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/${role}/submissions/${submissionId}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission_${submissionId}.tar.gz`; // Set the desired file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download file.');
    }
  };

  const handleEditTestCase = (testCaseId: number) => {
    setCurrentTestCaseId(testCaseId.toString());
    setOpenModal('testcase');
  };

  if (isAssignmentLoading) {
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
          <Title level={1}>{assignment.assignmentName}</Title>
        </div>

        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>{assignment.description}</Paragraph>
        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>Due Date: {dayjs(assignment.dueDate).format('YYYY-MM-DD HH:mm')}</Paragraph>

        {role === 'lecturer' && (
          <>
           <div style={footerLineStyle}/>
            <div style={{ flexDirection: 'row' }}>
              <Button type="primary" onClick={() => setOpenModal('edit')} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center', marginRight: '10px' }}>
                Edit Assignment
              </Button>

              <Button type="primary" onClick={() => handleEditTestCase(-1)} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center' }}>
                Create Autotest
              </Button>
            </div>
          </>
        )}
      </div>

      <Title level={3}>{role === 'student' ? 'Submissions' : 'Enrolled Students'}</Title>
      {role === 'student' && (
        <Button type="primary" onClick={() => setOpenModal('upload')} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center' }}>
          Add Submission
        </Button>
      )}
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', padding: '30px', borderRadius: '10px' }}>
          {role === 'student' && (
            <List
              className="demo-loadmore-list"
              loading={isAssignmentLoading}
              itemLayout="horizontal"
              dataSource={assignment.submissions}
              renderItem={(submission: Submission, index: number) => (
                <List.Item style={{ width: '100%' }}
                  actions={[
                    <a key="list-loadmore-download" onClick={() => downloadSubmission(submission.id)}>download</a>
                  ]}
                >
                  <Skeleton loading={isAssignmentLoading} active>
                    <List.Item.Meta
                    style={{ textAlign: 'left' }}
                      title={`Submission ${assignment.submissions.length - index}`} // Increment the title by 1
                      description={`Submitted on: ${format(new Date(submission.submissionTime), 'HH:mm dd/MM/yyyy')}`}
                    />
                  </Skeleton>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      <Title level={3}>Test Cases</Title>
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', padding: '30px', borderRadius: '10px' }}>
            <List
              className="demo-loadmore-list"
              loading={isAssignmentLoading}
              itemLayout="horizontal"
              dataSource={assignment.testCases}
              renderItem={(testCase: TestCase, index: number) => (
                <List.Item style={{ width: '100%' }}
                actions={[
                  <a key="list-loadmore-download" onClick={() => handleEditTestCase(testCase.id)}>edit</a>
                ]}
                >
                  <Skeleton loading={isAssignmentLoading} active>
                    <List.Item.Meta
                      style={{ textAlign: 'left' }}
                      title={`${index + 1}`} // Increment the title by 1
                      description={
                        <div>
                          <div><strong>Input:</strong> {testCase.input}</div>
                          <div><strong>Expected Output:</strong> {testCase.expectedOutput}</div>
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              )}
            />
        </div>
      </div>

      <EditAssignmentModal
        isModalVisible={openModal === 'edit'}
        enrolmentId={enrolmentId || ''}
        closeModal={() => setOpenModal('')}
        assignment={{ ...assignment, id: assignmentId }}
        refetchAssignment={refetchAssignment}
      />

      <UploadSubmissionModal
        isModalVisible={openModal === 'upload'}
        closeModal={() => setOpenModal('')}
        assignmentId={assignmentId || ''}
        refetchAssignment={refetchAssignment}
      />

      <AutotestModal
        isModalVisible={openModal === 'testcase'}
        testCaseId={currentTestCaseId || ''}
        testCases={assignment.testCases}
        closeModal={() => setOpenModal('')}
        assignmentId={assignmentId || ''}
        refetchAssignment={refetchAssignment}
      />
    </Layout>
  );
};

export default AssignmentDetails;
