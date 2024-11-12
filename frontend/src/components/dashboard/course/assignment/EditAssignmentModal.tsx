import React from 'react';
import { Modal, Form, Input, DatePicker, Checkbox, Button, message } from 'antd';
import dayjs from 'dayjs'; // Import dayjs
import Cookies from 'js-cookie';
import { config } from '../../../../config';

interface EditAssignmentModalProps {
  isModalVisible: boolean;
  enrolmentId: string;
  closeModal: () => void;
  assignment: {
    id: string;
    assignmentName: string;
    description: string;
    dueDate: string;
    isGroupAssignment: boolean;
    defaultShCmd: string;
  };
  refetchAssignment: () => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ isModalVisible, enrolmentId, closeModal, assignment, refetchAssignment }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await updateAssignment(values);
      refetchAssignment();
      closeModal();
      message.success('Assignment updated successfully.');
    } catch (error) {
      console.error('Failed to update assignment:', error);
      message.error('Failed to update assignment.');
    }
  };

  const updateAssignment = async (values: any) => {
    const token = Cookies.get('token') || '';
    try {
      const payload = {
        assignmentName: values.title,
        description: values.description,
        dueDate: values.dueDate,
        isGroupAssignment: values.isGroupAssignment,
        defaultShCmd: values.defaultShCmd
      };
      const response = await fetch(`${config.backendUrl}/api/lecturer/courses/${enrolmentId}/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }
      const result = await response.json();
      console.log('Update successful:', result);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    const token = Cookies.get('token') || '';
    try {
      const response = await fetch(`${config.backendUrl}/api/lecturer/assignments/${assignment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
      refetchAssignment();
      closeModal();

      message.success('Assignment deleted successfully.');
    } catch (error) {
      message.error('Failed to delete assignment.');
    }
  };

  return (
    <Modal
      title="Edit Assignment"
      open={isModalVisible}
      onCancel={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button key="delete" type="primary" danger onClick={handleDelete}>
            Delete
          </Button>
          <div>
            <Button key="cancel" onClick={closeModal} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button key="save" type="primary" onClick={handleOk}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: assignment.assignmentName,
          description: assignment.description,
          dueDate: assignment.dueDate ? dayjs(assignment.dueDate) : null,
          isGroupAssignment: assignment.isGroupAssignment,
          defaultShCmd: assignment.defaultShCmd,
        }}
      >
        <Form.Item
          name="title"
          label="Assignment Title"
          rules={[{ required: true, message: 'Please enter the assignment title' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Assignment Description"
          rules={[{ required: true, message: 'Please enter the assignment description' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[{ required: true, message: 'Please select the due date and time' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        <Form.Item
          name="isGroupAssignment"
          label="Is Group Assignment"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          name="defaultShCmd"
          label="Default Shell Command"
          rules={[{ required: true, message: 'Please enter the default shell command' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAssignmentModal;
