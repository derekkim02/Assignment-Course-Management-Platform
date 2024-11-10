import React, { useEffect, useRef } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Form, Select, Button, message, Spin, Space } from 'antd';
import Cookies from 'js-cookie';
import { config } from '../../../config';
import { useAdminGetCourseOffering } from '../../../queries';

interface User {
  zid: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface EditCourseOfferingModalProps {
  courseId: string;
  isOpen: boolean;
  closeModal: () => void;
  users: User[];
}

const EditCourseOfferingModal: React.FC<EditCourseOfferingModalProps> = ({
  courseId,
  isOpen,
  closeModal,
  users,
}) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();
  // Create a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: courseOffering, isLoading: isLoadingCourseOffering, refetch } = useAdminGetCourseOffering(courseId);

  useEffect(() => {
    if (courseId) {
      refetch();
    }
  }, [courseId, refetch]);

  useEffect(() => {
    if (courseOffering) {
      form.setFieldsValue({
        lecturer: courseOffering.lecturer ? courseOffering.lecturer.zid : undefined,
        tutors: courseOffering.tutors ? courseOffering.tutors.map((tutor: User) => tutor.zid) : [],
        students: courseOffering.students ? courseOffering.students.map((student: User) => student.zid) : [],
      });
    }
  }, [courseOffering, form]);

  const handleEditCourseOffering = async (values: { lecturer: number[]; tutors: number[]; students: number[]; courseId: number; termYear: number; termTerm: number }) => {
    try {
      const payload = {
        lecturerId: values.lecturer[0],
        tutorsIds: values.tutors,
        studentIds: values.students,
      };

      await fetch(`${config.backendUrl}/api/admin/course-offerings/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      message.success('Course offering updated successfully');
      closeModal();
      form.resetFields();
      refetch();
    } catch {
      message.error('Failed to update course offering');
    }
  };

  if (isLoadingCourseOffering) {
    return (
      <Modal
        title="Edit Course Offering"
        open={isOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Spin size="large" />
      </Modal>
    );
  }

  if (!courseOffering) {
    return null;
  }

  const handleUpload = async (file: File) => {
    const isCsv = file.name.endsWith('.csv');
    if (!isCsv) {
      message.error('You can only upload CSV files!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch(`${config.backendUrl}/api/admin/course-offerings/${courseId}/import-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        message.success(`${file.name} file uploaded successfully`);
        refetch();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || `${file.name} file upload failed.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
      // Reset the input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal
      title="Edit Course Offering"
      open={isOpen}
      onCancel={closeModal}
      footer={null}
    >
      <Form form={form} onFinish={handleEditCourseOffering} initialValues={{
        lecturer: courseOffering.lecturer ? courseOffering.lecturer.zid : undefined,
        tutors: courseOffering.tutors ? courseOffering.tutors.map((tutor: User) => tutor.zid) : [],
        students: courseOffering.students ? courseOffering.students.map((student: User) => student.zid) : [],
      }}>
        <Form.Item
          name="lecturer"
          label="Select Lecturer"
          rules={[{ required: true, message: 'Please select at least one lecturer' }]}
        >
          <Select
            placeholder="Select lecturer"
          >
            {users?.map((user: User) => (
              <Select.Option key={user.zid} value={user.zid}>
                {user.firstName} {user.lastName} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tutors"
          label="Select Tutors"
        >
          <Select
            mode="multiple"
            placeholder="Select tutors"
          >
            {users?.map((user: User) => (
              <Select.Option key={user.zid} value={user.zid}>
                {user.firstName} {user.lastName} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="students"
          label="Select Students"
        >
          <Select
            mode="multiple"
            placeholder="Select students"
          >
            {users?.map((user: User) => (
              <Select.Option key={user.zid} value={user.zid}>
                {user.firstName} {user.lastName} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <label htmlFor="csv-upload">
              <Button onClick={handleButtonClick} icon={<UploadOutlined />}>
                Import via CSV
              </Button>
            </label>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCourseOfferingModal;
