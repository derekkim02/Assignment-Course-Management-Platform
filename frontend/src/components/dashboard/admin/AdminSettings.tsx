import React, { useState } from 'react';
import { Layout, Table, Button, message, Collapse } from 'antd';
import type { TableProps } from 'antd';
import { useUsers, useCourses, useAdminCourseOfferings } from '../../../queries';
import Cookies from 'js-cookie';
import { config } from '../../../config';
import CreateCourseModal from './CreateCourseModal';
import CreateCourseOfferingModal from './CreateCourseOfferingModal';
import EditCourseOfferingModal from './EditCourseOfferingModal';
import CreateElsModal from './CreateElsModal';

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

const AdminSettings: React.FC = () => {
  const token = Cookies.get('token') || '';
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();
  const { data: courses, isLoading: isLoadingCourses, refetch: refetchCourses } = useCourses('IgiveAdmin');
  const { data: courseOfferings, isLoading: isLoadingCourseOfferings } = useAdminCourseOfferings();

  const [paginationPos] = useState<TablePaginationPosition<User>>('bottomRight');
  const [currentCourseOfferingId, setCurrentCourseOfferingId] = useState('1');
  const [openModal, setOpenModal] = useState('');

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
    setOpenModal('createELS');
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

  const getCourseId = (courseCode: string, term: string) => {
    const course = courseOfferings.find((course: Course) => course.courseCode === courseCode && course.term === term);
    if (!course) {
      return null;
    }
    return course.id;
  };

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
          <Button type="primary" onClick={() => setOpenModal('createELS')}>
            Create ELS
          </Button>
        </div>
        <Collapse>
          <Panel header="Courses" key="1">
            <Table
              dataSource={courseOfferings}
              columns={courseOfferingColumns}
              loading={isLoadingCourseOfferings}
              rowKey="courseCode"
              pagination={false}
              onRow={(record: Course) => ({
                onClick: () => {
                  const courseId = getCourseId(record.courseCode, record.term);
                  setCurrentCourseOfferingId(courseId);
                  setOpenModal('editCourseOffering');
                },
                style: { cursor: 'pointer' }
              })}
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
        <CreateElsModal
          isOpen={openModal === 'createELS'}
          closeModal={() => setOpenModal('')}
        />

      </Content>
    </Layout>
  );
};

export default AdminSettings;
