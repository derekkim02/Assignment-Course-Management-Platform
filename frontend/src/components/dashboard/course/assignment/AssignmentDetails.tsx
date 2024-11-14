import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Button, Spin, Skeleton, message, Pagination, Input } from 'antd';
import dayjs from 'dayjs';
import { bannerStyle, footerLineStyle, listContainerStyle } from '../styles';
import { useEnrollment, useAssignment, useSubmissions } from '../../../../queries';
import { format } from 'date-fns';
import UploadSubmissionModal from './UploadSubmissionModal';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import AutotestModal from './AutotestModal';
import MarkingModal from './MarkingModal';
import AssignmentModal from '../AssignmentModal';
import { useWatch } from 'antd/es/form/Form';

const { Search } = Input;
const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  submissionTime: string;
  studentId: number;
  isMarked: boolean;
}

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface User {
  zid: number;
  firstName: string;
  lastName: string;
  email: string;
}

const AssignmentDetails: React.FC = () => {
  const { role, enrolmentId, assignmentId } = useParams<{
    role: string;
    enrolmentId: string;
    assignmentId: string;
  }>();
  const { data: assignment, isLoading: isAssignmentLoading, error: assignmentError, refetch: refetchAssignment } = useAssignment(role || '', assignmentId || '');
  const { data: courseOffering, refetch: refetchCourseOffering } = useEnrollment(role || '', enrolmentId || '');
  const token = Cookies.get('token') || '';
  const [openModal, setOpenModal] = useState<string>('');
  const [currentTestCaseId, setCurrentTestCaseId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredStudents, setFilteredStudents] = useState<User[]>(courseOffering?.students || []);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(assignment?.submissions || []);
  const [viewSubmissions, setViewSubmissions] = useState(false);
  const [titleCard, setTitleCard] = useState(role === 'student' ? 'Submissions' : 'Enrolled Students');
  const [submissionId, setSubmissionId] = useState('');
  const { data: submissions, refetch: refetchSubmission } = useSubmissions(role || '', assignmentId || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Runs on page load and whenever courseOffering changes
  useEffect(() => {
    handlePageChange(1, pageSize);
  }, [courseOffering]);

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

  const handleMarkSubmission = async (submissionId: number) => {
    setSubmissionId(submissionId.toString());

    setOpenModal('marking');
    // Mark the submission
  };

  const handleEditTestCase = (testCaseId: number) => {
    setCurrentTestCaseId(testCaseId.toString());
    setOpenModal('testcase');
  };

  const handleMarkSubmissions = () => {
    message.info('Marking submissions...');
    fetch(`${config.backendUrl}/api/lecturer/assignments/${assignmentId}/mark`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to mark submissions');
      }
      refetchAssignment();
      message.success('Submissions marked successfully!');
    })
      .catch((error) => {
        message.error(`Failed to mark submissions: ${error}`);
      });
  };

  const handleViewSubmissions = (zid: number, name: string) => {
    refetchSubmission();
    const filtered: Submission[] = submissions.filter((sub: Submission) => sub.studentId === zid);
    setFilteredSubmissions(filtered);

    setTitleCard(`${name}'s Submissions`);
    setViewSubmissions(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered: User[] = courseOffering.enrolledStudents.filter((student: User) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.zid.toString().includes(query)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const handleCollectGrades = () => {
    message.info('Downloading grades...');
    try {
      fetch(`${config.backendUrl}/api/lecturer/assignments/${assignmentId}/grades`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to collect grades!');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assignment${assignmentId}_grades.tar.gz`; // Set the desired file name
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success('Grades collected successfully!');
      })
        .catch((error) => {
          message.error(`Failed to download grades: ${error}`);
        });
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download file.');
    }
  }

  // Handle pagination
  const handlePageChange = (page: number, size?: number) => {
    refetchCourseOffering();
    setCurrentPage(page);
    // Use the provided size or fall back to current pageSize
    const newSize = size || pageSize;
    if (size) {
      setPageSize(size);
    }

    let filtered;

    if (courseOffering.enrolledStudents) {
      filtered = courseOffering.enrolledStudents.slice(
        (page - 1) * newSize,
        page * newSize
      );
    } else {
      filtered = [];
    }
    setFilteredStudents(filtered);
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

        {(role === 'lecturer') && (
          <>
           <div style={footerLineStyle}/>
            <div style={{ flexDirection: 'row' }}>
              <Button type="primary" onClick={() => setOpenModal('edit')} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center', marginRight: '10px' }}>
                Edit Assignment
              </Button>

              <Button type="primary" onClick={() => handleEditTestCase(-1)} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center', marginRight: '10px' }}>
                Create Autotest
              </Button>

              <Button type="primary" onClick={handleMarkSubmissions} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center', marginRight: '10px' }}>
                Mark Submissions
              </Button>

              <Button type="primary" onClick={handleCollectGrades} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center' }}>
                Collect Grades
              </Button>
            </div>
          </>
        )}
      </div>

        <Title level={3}>{titleCard}</Title>
      {role === 'student' && (
        <Button type="primary" onClick={() => setOpenModal('upload')} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center' }}>
          Add Submission
        </Button>
      )}
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', borderRadius: '10px' }}>
          {(role === 'student' || ((role === 'lecturer' || role === 'tutor') && viewSubmissions)) && (
            <List
              className="demo-loadmore-list"
              loading={isAssignmentLoading}
              itemLayout="horizontal"
              dataSource={filteredSubmissions}
              renderItem={(submission: Submission, index: number) => (
                <List.Item style={{ paddingRight: '10px', paddingLeft: '10px', width: '100%' }}
                  actions={[
                    <>
                      <a key="list-loadmore-download" onClick={() => downloadSubmission(submission.id)}>Download</a>
                      {(role === 'tutor') && (<><br /><a onClick={() => handleMarkSubmission(submission.id)}>{submission.isMarked ? 'Remark' : 'Mark'}</a></>)}
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
          )}
          {(role === 'lecturer' || role === 'tutor') && !viewSubmissions && (
            <>
              <Search
                placeholder="Search by name, email, or zid"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                style={{ marginBottom: '20px' }}
              />
              <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={filteredStudents}
                renderItem={(student: { zid: number; firstName: string; lastName: string; email: string }) => (
                  <>
                    <List.Item onClick={() => handleViewSubmissions(student.zid, `${student.firstName} ${student.lastName}`)}>
                      <List.Item.Meta
                        title={`${student.firstName} ${student.lastName}`}
                        description={
                          <>
                            Email: {student.email}
                            <br />
                            ZID: {student.zid}
                          </>
                        }
                      />
                    </List.Item>
                  </>
                )}
              />
              <Pagination
                defaultCurrent={1}
                current={currentPage}
                pageSize={pageSize}
                total={courseOffering.enrolledStudents.length || 0}
                align="center"
                onChange={handlePageChange}
              />;
            </>
          )}
        </div>
      </div>

      {(role === 'lecturer') && !viewSubmissions && (
        <>
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
                          title={`Test ${index + 1}`} // Increment the title by 1
                          description={
                            <div>
                              <div><strong>Input:</strong> {testCase.input}</div>
                              <div><strong>Expected Output:</strong> {testCase.expectedOutput}</div>
                              <div><strong>Hidden:</strong> {testCase.isHidden ? 'Yes' : 'No'}</div>
                            </div>
                          }
                        />
                      </Skeleton>
                    </List.Item>
                  )}
                />
            </div>
          </div>
        </>
      )}

      <AssignmentModal
        isModalVisible={openModal === 'edit'}
        enrolmentId={enrolmentId || ''}
        closeModal={() => setOpenModal('')}
        assignment={{ ...assignment, id: assignmentId }}
        refetch={refetchAssignment}
      />

      <UploadSubmissionModal
        isModalVisible={openModal === 'upload'}
        closeModal={() => setOpenModal('')}
        assignmentId={assignmentId || ''}
        refetchAssignment={refetchAssignment}
        refetchSubmission={refetchSubmission}
      />

      <AutotestModal
        isModalVisible={openModal === 'testcase'}
        testCaseId={currentTestCaseId || ''}
        testCases={assignment.testCases}
        closeModal={() => setOpenModal('')}
        assignmentId={assignmentId || ''}
        refetchAssignment={refetchAssignment}
      />

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

export default AssignmentDetails;
