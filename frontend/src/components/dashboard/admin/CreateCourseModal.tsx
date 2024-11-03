import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';

interface CreateCourseModalProps {
  refetch: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ refetch, closeModal, isOpen }) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();

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
      closeModal();
      form.resetFields();
      refetch();
    } catch {
      message.error('Failed to create course');
    }
  };

  return (
  <Modal
      title="Create Course"
      open={isOpen}
      onCancel={() => closeModal()}
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
  );
};

export default CreateCourseModal;
