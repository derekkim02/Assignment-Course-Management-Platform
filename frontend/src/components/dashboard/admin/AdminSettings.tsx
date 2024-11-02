import React, { useState } from 'react';
import { Layout, Table, Button, message, Form, Input, Modal, Select, Collapse, List } from 'antd';
import { useUsers, useCourses, useAdminCourseOfferings } from '../../../queries';
import Cookies from 'js-cookie';
import { config } from '../../../config';
import CreateCourseModal from './CreateCourseModal';
import CreateCourseOfferingModal from './CreateCourseOfferingModal';

const { Content } = Layout;
const { Option } = Select;
const { Panel } = Collapse;

interface User {
  zid: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

const AdminSettings: React.FC = () => {
  const token = Cookies.get('token') || '';
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();
  const { data: courses, isLoading: isLoadingCourses, refetch: refetchCourses } = useCourses('IgiveAdmin');
  const { data: courseOfferings, isLoading: isLoadingCourseOfferings } = useAdminCourseOfferings();

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
    } catch (error) {
      message.error('Failed to update user role');
    }
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

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Table
          dataSource={users || []}
          columns={userColumns}
          rowKey="zid"
          loading={isLoadingUsers}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px', marginBottom: '20px' }}>
          <Button type="primary" onClick={() => setOpenModal('createCourse')} style={{ marginRight: '10px' }}>
            Create Course
          </Button>
          <Button type="primary" onClick={() => setOpenModal('createCourseOffering')}>
            Create Course Offering
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
              onRow={(record) => ({
                onClick: () => {
                  console.log('hji');
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

      </Content>
    </Layout>
  );
};

export default AdminSettings;
