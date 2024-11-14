import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';

interface EditElsStudentModalProps {
  closeModal: () => void;
  isOpen: boolean;
  studentId: string;
}

interface Els {
  id: string;
  name: string;
}

const EditElsStudentModal: React.FC<EditElsStudentModalProps> = ({ closeModal, isOpen, studentId }) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();
  const [elsList, setElsList] = useState<Els[]>([]);

  useEffect(() => {
    const fetchElsList = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/admin/els`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setElsList(data);
      } catch {
        message.error('Failed to fetch ELS list');
      }
    };

    fetchElsList();
  }, [token]);

  const handleEditStudentEls = async (values: { elsId: string }) => {
    try {
      const payload = {
        elsId: values.elsId
      };

      await fetch(`${config.backendUrl}/api/admin/students/${studentId}/els`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      message.success('Student ELS updated successfully');
      closeModal();
      form.resetFields();
    } catch {
      message.error('Failed to update student ELS');
    }
  };

  return (
    <Modal
      title="Edit Student ELS"
      open={isOpen}
      onCancel={() => closeModal()}
      footer={null}
    >
      <Form form={form} onFinish={handleEditStudentEls}>
        <Form.Item
          name="elsId"
          label="Select ELS"
          rules={[{ required: true, message: 'Please select an ELS' }]}
        >
          <Select>
            {elsList.map((els) => (
              <Select.Option key={els.id} value={els.id}>
                {els.name}
              </Select.Option>
            ))}
          </Select>
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
