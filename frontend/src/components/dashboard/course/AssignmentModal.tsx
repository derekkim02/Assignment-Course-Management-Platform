import React from 'react';
import { Modal, Form, Input, DatePicker, Checkbox, Button, message, Slider } from 'antd';
import dayjs from 'dayjs'; // Import dayjs
import Cookies from 'js-cookie';
import { config } from '../../../config';
import { useNavigate } from 'react-router-dom';

interface AssignmentModalProps {
  isModalVisible: boolean;
  enrolmentId: string;
  closeModal: () => void;
  assignment?: {
    id: string;
    assignmentName: string;
    description: string;
    dueDate: string;
    autoTestWeighting: number;
    isGroupAssignment: boolean;
    defaultShCmd: string;
  };
  refetch: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isModalVisible, enrolmentId, closeModal, assignment, refetch }) => {
  const [form] = Form.useForm();
  const token = Cookies.get('token') || '';
  const navigate = useNavigate();

  const isEditing = Boolean(assignment);

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await updateAssignment(values);
      refetch();
      closeModal();
      message.success('Assignment updated successfully.');
    } catch (error) {
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
        isGroupAssignment: Boolean(values.isGroupAssignment),
        autoTestWeighting: values.autoTestWeighting / 100,
        defaultShCmd: values.defaultShCmd
      };
      const response = await fetch(`${config.backendUrl}/api/lecturer/courses/${enrolmentId}/assignments/${assignment?.id}`, {
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
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    const token = Cookies.get('token') || '';
    try {
      const response = await fetch(`${config.backendUrl}/api/lecturer/assignments/${assignment?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
      refetch();
      closeModal();
      message.success('Assignment deleted successfully.');
      navigate(-1);
    } catch (error) {
      message.error('Failed to delete assignment.');
    }
  };

  const HandleCreate = () => {
    form.validateFields().then(values => {
      const payload = {
        assignmentName: values.title,
        description: values.description,
        dueDate: values.dueDate,
        isGroupAssignment: Boolean(values.isGroupAssignment),
        defaultShCmd: values.defaultShCmd,
        autoTestWeighting: values.autoTestWeighting / 100,
      };

      fetch(`${config.backendUrl}/api/lecturer/courses/${enrolmentId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }).then(() => {
        refetch();
        form.resetFields();
      });
      closeModal();
    }).catch(() => {
      // Do nothing on validation error
    });
  };

  return (
    <Modal
      title="Edit Assignment"
      open={isModalVisible}
      onCancel={closeModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {isEditing &&
            <Button key="delete" type="primary" danger onClick={handleDelete}>
              Delete
            </Button>
          }
          <div>
            <Button key="cancel" onClick={closeModal} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button key="save" type="primary" onClick={isEditing ? handleEdit : HandleCreate}>
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
          title: assignment?.assignmentName,
          description: assignment?.description,
          dueDate: assignment?.dueDate ? dayjs(assignment?.dueDate) : null,
          autoTestWeighting: assignment ? assignment.autoTestWeighting * 100 : 0,
          isGroupAssignment: assignment?.isGroupAssignment,
          defaultShCmd: assignment?.defaultShCmd,
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
            name="autoTestWeighting"
            label="Autotesting Weighting"
            rules={[{ required: true, message: 'Please set the autotesting weighting' }]}
          >
            <Slider
              min={0}
              max={100}
              marks={{
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%',
              }}
            />
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

export default AssignmentModal;
