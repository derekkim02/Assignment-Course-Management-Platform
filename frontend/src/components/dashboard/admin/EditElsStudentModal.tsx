import React, { useEffect } from 'react';
import { Modal, Form, Button, Select, message, Layout, Spin, DatePicker } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';
import { useStudentEls } from '../../../queries';
import { Content } from 'antd/es/layout/layout';
import dayjs from 'dayjs';

interface Els {
  id: string;
  name: string;
}
interface EditElsStudentModalProps {
  closeModal: () => void;
  isOpen: boolean;
  studentId: number;
  elsList: Els[];
}

const EditElsStudentModal: React.FC<EditElsStudentModalProps> = ({ closeModal, isOpen, studentId, elsList }) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();
  const { data: studentEls, isLoading: isStudentElsLoading, refetch: refetchStudentEls } = useStudentEls(studentId);

  useEffect(() => {
    if (studentEls) {
      form.setFieldsValue({
        elsId: studentEls.elsType.id,
        startDate: dayjs(studentEls.startDate),
        endDate: dayjs(studentEls.endDate),
      });
    }
  }, [studentEls, form]);

  const handleEditStudentEls = async (values: { elsId: string | number; startDate: any; endDate: any }) => {
    if (values.elsId === -1) {
      await fetch(`${config.backendUrl}/api/admin/users/${studentId}/els`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      }).then(() => {
        message.success('Student ELS removed successfully');
        refetchStudentEls();
        closeModalWrapper();
      });
      return;
    }

    try {
      const payload = {
        elsId: values.elsId,
        startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ssZ'),
        endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ssZ'),
      };

      await fetch(`${config.backendUrl}/api/admin/users/${studentId}/els`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }).then(() => {
        message.success('Student ELS updated successfully');
        refetchStudentEls();
        closeModalWrapper();
      });
    } catch {
      message.error('Failed to update student ELS');
    }
  };

  const closeModalWrapper = () => {
    form.resetFields();
    closeModal();
  };

  if (isStudentElsLoading) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Modal
      title="Edit Student ELS"
      open={isOpen}
      onCancel={() => closeModalWrapper()}
      footer={null}
    >
      <Form form={form} onFinish={handleEditStudentEls}>
        <Form.Item
          name="elsId"
          label="Select ELS"
          rules={[{ required: true, message: 'Please select an ELS' }]}
        >
          <Select>
            {elsList.map((els : Els) => (
              <Select.Option key={els.id} value={els.id}>
                {els.name}
              </Select.Option>
            ))}
            {studentEls && (
              <Select.Option value={-1}>None</Select.Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select the start date' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select the end date' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditElsStudentModal;
