import React, { useState } from 'react';
import { Layout, Table, Button, message, Form, Input, Modal, Select } from 'antd';
import { useUsers, useCourses } from '../../queries';
import Cookies from 'js-cookie';
import { config } from '../../config';
import { useAuth } from '../auth/AuthContext';

const { Content } = Layout;
const { Option } = Select;

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
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers('IgiveAdmin');
  const { data: courses, isLoading: isLoadingCourses, refetch: refetchCourses } = useCourses('IgiveAdmin');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCourseOfferingModalVisible, setIsCourseOfferingModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [courseOfferingForm] = Form.useForm();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

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

  const handleCreateCourse = async (values: { name: string; code: string; description: string }) => {
    try {
      await fetch(`${config.backendUrl}/api/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      message.success('Course created successfully');
      setIsModalVisible(false);
      form.resetFields();
      refetchCourses();
    } catch (error) {
      message.error('Failed to create course');
    }
  };

  const handleCreateCourseOffering = async (values: { lecturerId: number; courseId: number; termYear: number; termTerm: number }) => {
    try {
      await fetch(`${config.backendUrl}/api/admin/course-offerings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      message.success('Course offering created successfully');
      setIsCourseOfferingModalVisible(false);
      courseOfferingForm.resetFields();
      refetchCourses();
    } catch (error) {
      message.error('Failed to create course offering');
    }
  };

  const columns = [
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

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Table
          dataSource={users || []}
          columns={columns}
          rowKey="zid"
          loading={isLoadingUsers}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
          <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginRight: '10px' }}>
            Create Course
          </Button>
          <Button type="primary" onClick={() => setIsCourseOfferingModalVisible(true)}>
            Create Course Offering
          </Button>
        </div>
        <Modal
          title="Create Course"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleCreateCourse}>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: 'Please enter the course name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="code"
              label="Course Code"
              rules={[{ required: true, message: 'Please enter the course code' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Course Description"
              rules={[{ required: true, message: 'Please enter the course description' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Create Course Offering"
          visible={isCourseOfferingModalVisible}
          onCancel={() => setIsCourseOfferingModalVisible(false)}
          footer={null}
        >
          <Form form={courseOfferingForm} onFinish={handleCreateCourseOffering}>
            <Form.Item
              name="lecturerId"
              label="Select Lecturer"
              rules={[{ required: true, message: 'Please select a lecturer' }]}
            >
              <Select placeholder="Select a lecturer">
                {users?.map((user: User) => (
                  <Option key={user.zid} value={user.zid}>
                    {user.firstName} {user.lastName} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="courseId"
              label="Select Course"
              rules={[{ required: true, message: 'Please select a course' }]}
            >
              <Select placeholder="Select a course">
                {courses?.map((course: Course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="termYear"
              label="Term Year"
              rules={[{ required: true, message: 'Please enter the term year' }]}
            >
              <Select placeholder="Select a term year">
                {yearOptions.map(year => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="termTerm"
              label="Term"
              rules={[{ required: true, message: 'Please select a term' }]}
            >
              <Select placeholder="Select a term">
                <Option value={1}>T1</Option>
                <Option value={2}>T2</Option>
                <Option value={3}>T3</Option>
                <Option value={0}>Summer Term</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminSettings;
