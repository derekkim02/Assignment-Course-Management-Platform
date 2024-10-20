import React, { useState } from 'react';
import { Layout, Row, Col, Card, Typography, Button, Modal, Form, Input, message } from 'antd';
import { Link } from 'react-router-dom';
import { useCourses } from '../../../queries';
import Cookies from 'js-cookie';
import { useAuth } from '../../auth/AuthContext';
import { config } from '../../../config';
import { useQueryClient } from '@tanstack/react-query';

const { Content } = Layout;
const { Meta } = Card;
const { Title } = Typography;

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  term: string;
}

interface DecodedToken {
  email: string;
  role: string;
  exp: number;
}

const CoursesSection: React.FC = () => {
  const { data: courses, isLoading, error } = useCourses('marker');
  const auth = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = auth.isIGiveAdmin;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateCourse = async (values: { name: string; code: string; description: string }) => {
    const token = Cookies.get('token') || '';
    try {
      await fetch(`${config.backendUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      message.success('Course created successfully');
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch (error) {
      message.error('Failed to create course');
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        {isAdmin && (
          <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '20px' }}>
            Create Course
          </Button>
        )}
        <Row gutter={[32, 32]} wrap>
          {courses?.map((course: Course) => (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`${course.id}`}>
                <Card hoverable style={{ marginBottom: '20px' }}>
                  <Meta title={course.name} description={course.description} />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
        <Modal
          title="Create Course"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleCreateCourse}>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: 'Please enter the course name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="code"
              label="Course Code"
              rules={[{ required: true, message: 'Please enter the course code' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Course Description"
              rules={[{ required: true, message: 'Please enter the course description' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default CoursesSection;
