import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Button, Spin, Skeleton, message, Pagination, Input } from 'antd';
import dayjs from 'dayjs';
import { bannerStyle, footerLineStyle, listContainerStyle } from '../styles';
import { useEnrollment, useAssignment, useSubmissions } from '../../../../queries';
import { format } from 'date-fns';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import MarkingModal from './MarkingModal';

const { Search } = Input;
const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  submissionTime: string;
  studentId: number;
  isMarked: boolean;
}

const ViewStudentSubmission: React.FC = () => {
  const { role, enrolmentId, assignmentId, studentId } = useParams<{
    role: string;
    enrolmentId: string;
    assignmentId: string;
    studentId: string;
  }>();

  const { data: assignment, isLoading: isAssignmentLoading, error: assignmentError, refetch: refetchAssignment } = useAssignment(role || '', assignmentId || '');
  const { data: courseOffering, isLoading: isLoadingCourseOffering, refetch: refetchCourseOffering, } = useEnrollment(role || '', enrolmentId || '');
  const token = Cookies.get('token') || '';
  const [openModal, setOpenModal] = useState<string>('');
  const [submissionId, setSubmissionId] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const { data: submissions, isLoading: isSubmissionsLoading, refetch: refetchSubmission } = useSubmissions(role || '', assignmentId || '');
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    if (submissions) {
      const filteredSubmissions = submissions.filter((submission: Submission) => submission.studentId.toString() === studentId);
      setFilteredSubmissions(filteredSubmissions);
    }
  }, [submissions]);

  useEffect(() => {
    if (courseOffering) {
      const student = courseOffering.enrolledStudents.find((student: any) => student.zid.toString() === studentId);

      if (student) {
        setStudentName(`${student.firstName} ${student.lastName}`);
      }
    }
  }, [courseOffering]);

  // Runs on page load and whenever courseOffering changes

  const handleMarkSubmission = async (submissionId: number) => {
    setSubmissionId(submissionId.toString());
    setOpenModal('marking');
  };

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

  if (isAssignmentLoading) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (assignmentError) {
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
        <Paragraph style={{ color: '#A3A3A3' }}>{assignment.description || assignment.assignmentDescription}</Paragraph>
        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>Due Date: {dayjs(assignment.dueDate).format('YYYY-MM-DD HH:mm')}</Paragraph>

      </div>

      <Title level={3}>{studentName} Submissions</Title>

      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', borderRadius: '10px' }}>
            <List
              className="demo-loadmore-list"
              loading={role === 'student' ? isAssignmentLoading : isSubmissionsLoading}
              itemLayout="horizontal"
              dataSource={filteredSubmissions}
              renderItem={(submission: Submission, index: number) => (
                <List.Item style={{ paddingRight: '10px', paddingLeft: '10px', width: '100%' }}
                  actions={[
                    <>
                      <a key="list-loadmore-download" onClick={() => downloadSubmission(submission.id)}>Download</a>
                      <br/>
                      <a onClick={() => handleMarkSubmission(submission.id)}>{submission.isMarked ? 'Remark' : 'Mark'}</a>
                    </>
                  ]}
                >
                  <Skeleton loading={isAssignmentLoading} active>
                    <List.Item.Meta
                    style={{ textAlign: 'left' }}
                      title={`Submission ${index + 1}`} // Increment the title by 1
                      description={`Submitted on: ${format(new Date(submission.submissionTime), 'HH:mm dd/MM/yyyy')}`}
                    />
                  </Skeleton>
                </List.Item>
              )}
            />
        </div>
      </div>

      <MarkingModal
        isModalVisible={openModal === 'marking'}
        submissionId={submissionId || ''}
        role={role || ''}
        closeModal={() => setOpenModal('')}
        refetchAssignment={refetchAssignment}
      />
    </Layout>
  );
};

export default ViewStudentSubmission;
