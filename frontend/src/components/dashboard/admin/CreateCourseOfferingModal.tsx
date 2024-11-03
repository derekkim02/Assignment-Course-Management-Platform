import React from 'react';
import { Modal, Form, Select, Button, message } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';

const { Option } = Select;

interface User {
  zid: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface CreateCourseOfferingModalProps {
  isOpen: boolean;
  closeModal: () => void;
  users: User[];
  courses: Course[];
}

const CreateCourseOfferingModal: React.FC<CreateCourseOfferingModalProps> = ({
  isOpen,
  closeModal,
  users,
  courses,
}) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

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
      closeModal();
      form.resetFields();
    } catch {
      message.error('Failed to create course offering');
    }
  };

  return (
    <Modal
      title="Create Course Offering"
      open={isOpen}
      onCancel={() => closeModal()}
      footer={null}
    >
      <Form form={form} onFinish={handleCreateCourseOffering}>
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
  );
};

export default CreateCourseOfferingModal;
