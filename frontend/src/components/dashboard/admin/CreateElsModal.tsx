import React from 'react';
import { Modal, Form, Input, Button, InputNumber, message } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';

interface CreateElsModalProps {
  closeModal: () => void;
  isOpen: boolean;
}

const CreateElsModal: React.FC<CreateElsModalProps> = ({ closeModal, isOpen }) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();

  const handleCreateEls = async (values: { name: string; days: number }) => {
    try {
      const payload = {
        name: values.name,
        extraDays: values.days
      };

      await fetch(`${config.backendUrl}/api/admin/els`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      message.success('ELS created successfully');
      closeModal();
      form.resetFields();
    } catch {
      message.error('Failed to create ELS');
    }
  };

  return (
    <Modal
      title="Create ELS"
      open={isOpen}
      onCancel={() => closeModal()}
      footer={null}
    >
      <Form form={form} onFinish={handleCreateEls}>
        <Form.Item
          name="name"
          label="ELS Name"
          rules={[{ required: true, message: 'Please enter the ELS name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="days"
          label="Number of Extra Days"
          rules={[{ required: true, message: 'Please enter the number of days' }]}
        >
          <InputNumber min={1} />
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

export default CreateElsModal;
