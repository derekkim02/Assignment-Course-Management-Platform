import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, InputNumber, message } from 'antd';
import { config } from '../../../config';
import Cookies from 'js-cookie';
import { useEls } from '../../../queries';

interface ElsModalProps {
  closeModal: () => void;
  isOpen: boolean;
  elsId: string;
  refetch: () => void;
}

const ElsModal: React.FC<ElsModalProps> = ({ closeModal, isOpen, elsId, refetch }) => {
  const token = Cookies.get('token') || '';
  const [form] = Form.useForm();
  const { data: els, isLoading: isElsLoading, refetch: refetchEls } = useEls(parseInt(elsId));

  useEffect(() => {
    if (els) {
      form.setFieldsValue({
        name: els.name,
        days: els.extraDays
      });
    }
  }, [els]);

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
      refetch();
      closeModalWrapper();
    } catch {
      message.error('Failed to create ELS');
    }
  };

  const closeModalWrapper = () => {
    closeModal();
    form.resetFields();
  };

  const handleEditEls = async (values: { name: string; days: number }) => {
    try {
      const payload = {
        name: values.name,
        extraDays: values.days
      };

      await fetch(`${config.backendUrl}/api/admin/els/${elsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      message.success('ELS created successfully');
      refetch();
      closeModalWrapper();
    } catch {
      message.error('Failed to create ELS');
    }
  };

  const handleDelete = () => {
    try {
      fetch(`${config.backendUrl}/api/admin/els/${elsId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      }).then(() => {
        message.success('ELS deleted successfully');
        refetch();
        closeModalWrapper();
      });
    } catch {
      message.error('Failed to create ELS');
    }
  };

  return (
    <Modal
      title="Create ELS"
      open={isOpen}
      onCancel={() => closeModalWrapper()}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {els && (
          <Button key="delete" type="primary" danger onClick={handleDelete}>
            Delete
          </Button>
          )}
          <Button key="save" type="primary" onClick={() => form.submit()}>
            Save
          </Button>
        </div>
      }
    >
      <Form form={form} onFinish={els ? handleEditEls : handleCreateEls}>
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
      </Form>
    </Modal>
  );
};

export default ElsModal;
