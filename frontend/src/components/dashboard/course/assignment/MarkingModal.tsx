import React, { useEffect } from 'react';
import { Modal, Form, Input, Slider, Button, message } from 'antd';
import Cookies from 'js-cookie';
import { config } from '../../../../config';
import { useViewSubmission } from '../../../../queries';
import { common } from '@mui/material/colors';

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

  const { data: mark, isLoading: isMarkLoading, refetch: refetchMark } = useViewSubmission(role, submissionId);

  useEffect(() => {
    if (mark) {
      form.setFieldsValue({
        styleMark: parseInt(mark.styleMark),
        comments: mark.markerComments,
      });
    }
  }, [mark, isMarkLoading]);

  const closeModalWrapper = () => {
    form.resetFields();
    closeModal();
  };

  const handleMark = async () => {
    try {
      const values = await form.validateFields();
      sendRequest(`${config.backendUrl}/api/${role}/submissions/${submissionId}`, 'PUT', values).then((res) => {
        refetchAssignment();
        closeModalWrapper();
        if (!res.ok) {
          message.error('Failed to mark');
          return;
        }
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
    return await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
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
          rules={[{ required: false, message: 'Please enter any comments.' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MarkingModal;
