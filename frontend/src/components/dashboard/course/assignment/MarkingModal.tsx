import React from 'react';
import { Modal, Form, Input, Slider, Button, message } from 'antd';
import Cookies from 'js-cookie';
import { config } from '../../../../config';

interface MarkingModalProps {
  isModalVisible: boolean;
  submissionId: string;
  role: string;
  closeModal: () => void;
  refetchAssignment: () => void;
}

const MarkingModal: React.FC<MarkingModalProps> = ({ isModalVisible, role, submissionId, closeModal, refetchAssignment }) => {
  const [form] = Form.useForm();
  const token = Cookies.get('token') || '';

  const closeModalWrapper = () => {
    form.resetFields();
    closeModal();
  };

  const handleMark = async () => {
    try {
      const values = await form.validateFields();
      sendRequest(`${config.backendUrl}/api/tutor/submissions/${submissionId}`, 'PUT', values).then(() => {
        refetchAssignment();
        closeModalWrapper();
        message.success('Successfully marked.');
      });
    } catch (error) {
      message.error('Failed to mark submission.');
    }
  };

  const sendRequest = async (url: string, method: string, values: any) => {
    const payload = {
      styleMark: values.styleMark,
      markerComments: values.comments,
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed');
    }
    return await response.json();
  };

  return (
    <Modal
      title="Mark Submission"
      open={isModalVisible}
      onCancel={closeModalWrapper}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button key="cancel" onClick={closeModalWrapper} style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button key="save" type="primary" onClick={handleMark}>
            Save
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
            name="styleMark"
            label="Style Mark"
            rules={[{ required: true, message: 'Please set the style mark out of 100.' }]}
          >
            <Slider
              min={0}
              max={100}
              marks={{
                0: '0',
                25: '25',
                50: '50',
                75: '75',
                100: '100',
              }}
            />
        </Form.Item>
        <Form.Item
          name="comments"
          label="Marker Comments"
          rules={[{ required: false, message: 'Please enter any comments' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MarkingModal;
