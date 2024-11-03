import React, { useEffect } from 'react';
import { Modal, Form, Select, Button, message, Spin } from 'antd';
import Cookies from 'js-cookie';
import { config } from '../../../config';
import { useAdminGetCourseOffering } from '../../../queries';

interface User {
  zid: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

interface EditCourseOfferingModalProps {
  courseId: string;
  isOpen: boolean;
  closeModal: () => void;
  users: User[];
  courses: Course[];
}

const EditCourseOfferingModal: React.FC<EditCourseOfferingModalProps> = ({
  courseId,
  isOpen,
  closeModal,
  users,
  courses,
}) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();

  const { data: courseOffering, isLoading: isLoadingCourseOffering, refetch } = useAdminGetCourseOffering(courseId);

  useEffect(() => {
    if (courseId) {
      refetch();
    }
  }, [courseId, refetch]);

  useEffect(() => {
    if (courseOffering) {
      form.setFieldsValue({
        lecturer: courseOffering.lecturer ? [courseOffering.lecturer.zid] : [],
        tutors: courseOffering.tutors ? courseOffering.tutors.map((tutor: User) => tutor.zid) : [],
      });
    }
  }, [courseOffering, form]);

  const handleEditCourseOffering = async (values: { lecturer: number[]; tutors: number[]; students: number[]}) => {
    try {
      const request = {
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
        body: JSON.stringify(request)
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

  return (
    <Modal
      title="Edit Course Offering"
      open={isOpen}
      onCancel={closeModal}
      footer={null}
    >
      <Form form={form} onFinish={handleEditCourseOffering}>
        <Form.Item
          name="lecturer"
          label="Select Lecturer"
          rules={[{ required: true, message: 'Please select at least one lecturer' }]}
          initialValue={courseOffering.lecturer ? [courseOffering.lecturer.zid] : []}
        >
          <Select
            placeholder="Select lecturers"
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
          initialValue={courseOffering.tutors ? courseOffering.tutors.map((tutor: User) => tutor.zid) : []}
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
          initialValue={courseOffering.students ? courseOffering.students.map((student: User) => student.zid) : []}
        >
          <Select
            mode="multiple"
            placeholder="Select Students"
          >
            {users?.map((user: User) => (
              <Select.Option key={user.zid} value={user.zid}>
                {user.firstName} {user.lastName} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCourseOfferingModal;
