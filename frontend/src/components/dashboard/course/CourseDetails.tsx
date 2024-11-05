import React, { useEffect, useState } from 'react';
import { Layout, Typography, List, Card, Button, Modal, Form, Input, DatePicker, Spin, Checkbox } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEnrollment } from '../../../queries';
import { config } from '../../../config';
import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload } from 'jwt-decode';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Assignment {
  assignmentId: number;
  title: string;
  dueDate: string;
  weighting: number;
}

const CourseDetails: React.FC = () => {
  const { role, enrolmentId } = useParams<{ role: string, enrolmentId: string }>();
  const token = Cookies.get('token') || '';

  const { data: enrollment, isLoading: isLoadingCourses, error, refetch: refetchCourse } = useEnrollment(role || '', enrolmentId || '');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  useEffect(() => {
    if (enrollment) {
      refetchCourse();
    }
  }, [enrollment, refetchCourse]);

  const handleOk = () => {
    form.validateFields().then(values => {
      const payload = {
        assignmentName: values.title,
        description: values.description,
        dueDate: values.dueDate,
        isGroupAssignment: values.isGroupAssignment,
        defaultShCmd: values.defaultShCmd
      };
      fetch(`${config.backendUrl}/api/lecturer/courses/${enrolmentId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      refetchCourse();
      setIsModalVisible(false);
    }).catch(() => {
      // Do nothing on validation error
    });
  };

  if (isLoadingCourses) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: '20px' }}>
        <Content style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2}>Error</Title>
          <Paragraph>There was an error loading the course details. Please try again later.</Paragraph>
        </Content>
      </Layout>
    );
  }

  const bannerStyle = {
    backgroundColor: '#f0f2f5',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    width: '100%',
  }

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={bannerStyle}>
          <Title level={1} style={{ textAlign: 'left' }}>{enrollment.courseCode}</Title>
          <Title level={3} style={{ textAlign: 'left' }}>{enrollment.courseName}</Title>

        </div>

        <Paragraph>{enrollment.courseDescription}</Paragraph>
        <Title level={3}>Assignments</Title>
        {role === 'lecturer' && (
          <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
            Create Assignment
          </Button>
        )}
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={enrollment.assignments}
          renderItem={(assignment: Assignment) => (
            <List.Item>
              <Link to={`assignments/${assignment.assignmentId}`}>
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
        open={isModalVisible}
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
            initialValue={false}
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
    </Layout>
  );
};

export default CourseDetails;
