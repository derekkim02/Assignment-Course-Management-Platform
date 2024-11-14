import React, { useState } from 'react';
import { Layout, Table, Button, message, Collapse, Spin, Empty } from 'antd';
import type { TableProps } from 'antd';
import { useUsers, useCourses, useAdminCourseOfferings, useElsList } from '../../../queries';
import Cookies from 'js-cookie';
import { config } from '../../../config';
import CreateCourseModal from './CreateCourseModal';
import CreateCourseOfferingModal from './CreateCourseOfferingModal';
import EditCourseOfferingModal from './EditCourseOfferingModal';
import EditElsStudentModal from './EditElsStudentModal';
import ElsModal from './ElsModal';

const { Content } = Layout;
const { Panel } = Collapse;

interface User {
  zid: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface Course {
  courseName: string;
  courseCode: string;
  term: string;
}

type ColumnsType<T extends object> = TableProps<T>['columns'];
type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition<T extends object> = NonNullable<
  TablePagination<T>['position']
>[number];

interface Els {
  id: string;
  name: string;
}

const AdminSettings: React.FC = () => {
  const token = Cookies.get('token') || '';
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();
  const { data: courses, isLoading: isLoadingCourses, refetch: refetchCourses } = useCourses('IgiveAdmin');
  const { data: courseOfferings, isLoading: isLoadingCourseOfferings } = useAdminCourseOfferings();
  const { data: elsList, isLoading: isElsListLoading, refetch: refetchElsList } = useElsList();

  const [paginationPos] = useState<TablePaginationPosition<User>>('bottomRight');
  const [currentCourseOfferingId, setCurrentCourseOfferingId] = useState('1');
  const [openModal, setOpenModal] = useState('');
  const [editElsStudentId, setEditElsStudentId] = useState<number>(-1);

  const [currentElsId, setCurrentElsId] = useState<string>('');

  const handleRoleChange = async (zid: number, isAdmin: boolean) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/admin/change-role/${zid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAdmin })
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to update user role');
        return;
      }

      message.success('User role updated successfully');
      refetchUsers();
    } catch {
      message.error('Failed to update user role');
    }
  };

  const handleEditEls = (user: User) => {
    setEditElsStudentId(user.zid);
    setOpenModal('editEls');
  };

  const userColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: 'Admin',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (text: boolean, record: User) => (
        <Button
          type={text ? 'primary' : 'default'}
          onClick={() => handleRoleChange(record.zid, !text)}
        >
          {text ? 'Revoke Admin' : 'Grant Admin'}
        </Button>
      )
    },
    {
      title: 'ELS',
      dataIndex: 'elsDays',
      key: 'elsDays',
      render: (text: number, record: User) => (
        <Button onClick={() => handleEditEls(record)}>
          Edit ELS
        </Button>
      )
    }
  ];

  const courseOfferingColumns = [
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Term',
      dataIndex: 'term',
      key: 'term',
    },
  ];

  const elsColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Extra Days',
      dataIndex: 'extraDays',
      key: 'extraDays',
    },
  ];

  if (isElsListLoading) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  const closeElsModal = () => {
    setOpenModal('');
    setCurrentElsId('');
  };

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Table
          dataSource={users || []}
          columns={userColumns}
          rowKey="zid"
          loading={isLoadingUsers}
          pagination={{ position: [paginationPos] }}
          scroll={{ x: 'max-content' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px', marginBottom: '20px' }}>
          <Button type="primary" onClick={() => setOpenModal('createCourse')} style={{ marginRight: '10px' }}>
            Create Course
          </Button>
          <Button type="primary" onClick={() => setOpenModal('createCourseOffering')} style={{ marginRight: '10px' }}>
            Create Course Offering
          </Button>
          <Button type="primary" onClick={() => setOpenModal('ELSModalOpen')}>
            Create ELS
          </Button>
        </div>
        <Collapse style={{ marginBottom: '20px' }}>
          <Panel header="Courses" key="1">
            <Table
              dataSource={courseOfferings}
              columns={courseOfferingColumns}
              loading={isLoadingCourseOfferings}
              rowKey="courseCode"
              pagination={false}
              onRow={(record: Course) => ({
                onClick: () => {
                  const getCourseId = (courseCode: string, term: string) => {
                    const course = courseOfferings.find((course: Course) =>
                      course.courseCode === courseCode && course.term === term);
                    if (!course) {
                      return null;
                    }
                    return course.id;
                  };

                  const courseId = getCourseId(record.courseCode, record.term);
                  setCurrentCourseOfferingId(courseId);
                  setOpenModal('editCourseOffering');
                },
                style: { cursor: 'pointer' }
              })}
            />
          </Panel>
        </Collapse>
        <Collapse>
          <Panel header="ELS" key="2">
              <Table
                dataSource={elsList}
                columns={elsColumns}
                loading={isElsListLoading}
                rowKey="id"
                pagination={false}
                onRow={(record: Els) => ({
                  onClick: () => {
                    setCurrentElsId(record.id);
                    setOpenModal('ELSModalOpen');
                  },
                  style: { cursor: 'pointer' }
                })}
                locale={{
                  emptyText: (
                    <Empty description="No Els Types have been made." />
                  ),
                }}
              />
            </Panel>
        </Collapse>

        <CreateCourseModal isOpen={openModal === 'createCourse'}
          closeModal={() => setOpenModal('')}
          refetch={refetchCourses}
        />
        <CreateCourseOfferingModal
          isOpen={openModal === 'createCourseOffering'}
          closeModal={() => setOpenModal('')}
          users={users}
          courses={courses}
        />
        <EditCourseOfferingModal
          courseId={currentCourseOfferingId}
          isOpen={openModal === 'editCourseOffering'}
          closeModal={() => setOpenModal('')}
          users={users}
        />
        <ElsModal
          isOpen={openModal === 'ELSModalOpen'}
          closeModal={() => closeElsModal()}
          elsId={currentElsId}
          refetch={refetchElsList}
        />
        <EditElsStudentModal
          studentId={editElsStudentId}
          isOpen={openModal === 'editEls'}
          closeModal={() => setOpenModal('')}
          elsList={elsList}
        />

      </Content>
    </Layout>
  );
};

export default AdminSettings;
