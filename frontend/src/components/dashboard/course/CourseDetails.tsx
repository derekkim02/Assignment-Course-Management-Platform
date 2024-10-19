import React, { useState } from 'react';
import { Layout, Typography, List, Card, Button, Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import { Link } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  weighting: number;
}

const CourseDetails: React.FC = () => {
  const [courseName, setCourseName] = useState<string>('Dummy Course Name');
  const [courseDescription, setCourseDescription] = useState<string>('This is a brief description of the dummy course.');
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: 'Assignment 1', dueDate: '2023-10-01 10:00', weighting: 20 },
    { id: 2, title: 'Assignment 2', dueDate: '2023-11-01 12:00', weighting: 30 },
    { id: 3, title: 'Assignment 3', dueDate: '2023-12-01 14:00', weighting: 50 }
  ]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newAssignment: Assignment = {
        id: assignments.length + 1,
        title: values.title,
        dueDate: values.dueDate.format('YYYY-MM-DD HH:mm'),
        weighting: values.weighting
      };
      setAssignments([...assignments, newAssignment]);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>{courseName}</Title>
        <Paragraph>{courseDescription}</Paragraph>
        <Title level={3}>Assignments</Title>
        <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
          Create Assignment
        </Button>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={assignments}
          renderItem={assignment => (
            <List.Item>
              <Link to={`assignments/${assignment.id}`}>
                <Card title={assignment.title} hoverable>
                  <p>Due Date: {assignment.dueDate}</p>
                  <p>Weighting: {assignment.weighting}%</p>
                </Card>
              </Link>
            </List.Item>
          )}
        />
      </Content>

      <Modal
        title="Create Assignment"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Assignment Title"
            rules={[{ required: true, message: 'Please enter the assignment title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select the due date and time' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            name="weighting"
            label="Weighting (%)"
            rules={[{ required: true, message: 'Please enter the weighting' }]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default CourseDetails;
