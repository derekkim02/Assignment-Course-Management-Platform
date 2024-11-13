import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Button, message } from 'antd';
import Cookies from 'js-cookie';
import { config } from '../../../../config';

interface AutotestModalProps {
  isModalVisible: boolean;
  assignmentId: string;
  testCaseId: string;
  testCases: any[];
  closeModal: () => void;
  refetchAssignment: () => void;
}

const AutotestModal: React.FC<AutotestModalProps> = ({ isModalVisible, assignmentId, testCaseId, testCases, closeModal, refetchAssignment }) => {
  const [form] = Form.useForm();
  const token = Cookies.get('token') || '';
  const testCase = testCases ? testCases.find((testCase) => testCase.id === parseInt(testCaseId)) : null;

  useEffect(() => {
    if (testCase) {
      form.setFieldsValue({
        input: testCase.input,
        output: testCase.expectedOutput,
        isHidden: testCase.isHidden,
      });
    } else {
      form.resetFields();
    }
  }, [testCase, form]);

  const closeModalWrapper = () => {
    form.resetFields();
    closeModal();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      sendRequest(`${config.backendUrl}/api/lecturer/assignments/${assignmentId}/testcases`, 'POST', values).then(() => {
        refetchAssignment();
        closeModalWrapper();
        message.success('Test case created successfully.');
      });
    } catch (error) {
      message.error('Failed to create test case.');
    }
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      sendRequest(`${config.backendUrl}/api/lecturer/testcases/${testCaseId}`, 'PUT', values).then(() => {
        refetchAssignment();
        closeModalWrapper();
        message.success('Test case updated successfully.');
      });
    } catch (error) {
      message.error('Failed to update test case.');
    }
  };

  const sendRequest = (url: string, method: string, values: any) => {
    const payload = {
      input: values.input,
      output: values.output,
      isHidden: Boolean(values.isHidden),
    };

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed');
      }
      return response.json();
    });
  };

  const handleDelete = async () => {
    fetch(`${config.backendUrl}/api/lecturer/testcases/${testCaseId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete test case');
      }
      refetchAssignment();
      closeModalWrapper();
      message.success('Test case deleted successfully.');
    });
  };

  return (
    <Modal
      title="Create Autotest"
      open={isModalVisible}
      onCancel={closeModalWrapper}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {testCase && (
            <Button key="delete" type="primary" danger onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button key="cancel" onClick={closeModalWrapper} style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button key="save" type="primary" onClick={testCase ? handleEdit : handleCreate}>
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
          name="input"
          label="Test Case Input"
          rules={[{ required: true, message: 'Please enter the test case input' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="output"
          label="Expected Output"
          rules={[{ required: true, message: 'Please enter the expected output' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="isHidden"
          label="Is Hidden"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutotestModal;
