import React, { useEffect, useState } from 'react';
import { Layout, Typography, List, Button, Modal, Form, Input, DatePicker, Spin, Checkbox, Empty } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEnrollment } from '../../../queries';
import { format } from 'date-fns';
import { config } from '../../../config';
import Cookies from 'js-cookie';
import { CSSProperties } from 'styled-components';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Assignment {
  assignmentId: number;
  assignmentName: string;
  dueDate: string;
  description: string;
}

const CourseDetails: React.FC = () => {
  const { role, enrolmentId } = useParams<{ role: string, enrolmentId: string }>();
  const token = Cookies.get('token') || '';

  const { data: enrollment, isLoading: isLoadingCourses, error, refetch: refetchCourse } = useEnrollment(role || '', enrolmentId || '');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  console.log(enrollment);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

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
      }).then(() => {
        refetchCourse();
        form.resetFields();
      });
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
    marginBottom: '20px',
    width: '90%',
    alignSelf: 'center',
  };

  const listContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  const footerLineStyle: CSSProperties = {
    borderTop: '1px solid #d9d9d9',
    marginTop: '20px',
    paddingTop: '10px',
    textAlign: 'center',
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <div style={bannerStyle}>
        <div style={{ paddingTop: '10px', paddingLeft: '25px' }}>
          <Title level={1} style={{ textAlign: 'left' }}>{enrollment.courseCode}</Title>
          <Title level={3} style={{ textAlign: 'left' }}>{enrollment.courseName}</Title>
        </div>

          <div style={footerLineStyle}/>
          <Paragraph style={{ color: '#A3A3A3' }}>{enrollment.courseDescription}</Paragraph>

        {role === 'lecturer' && (
          <>
            <div style={footerLineStyle}/>
            <Button type="primary" onClick={showModal} style={{ alignSelf: 'left', width: '150px', marginBottom: '20px' }}>
              Create Assignment
            </Button>
          </>
        )}
      </div>

      <Title level={3}>Assignments</Title>
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', padding: '30px', borderRadius: '10px' }}>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{
              pageSize: 3,
            }}
            locale={{
              emptyText: (
                <Empty description="No assignments have been released yet." />
              ),
            }}
            dataSource={enrollment.assignments}
            renderItem={(assignment: Assignment) => (
              <List.Item
              key={assignment.assignmentId}
              >
                <Link to={`assignments/${assignment.assignmentId}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <List.Item.Meta
                    title={assignment.assignmentName}
                    description={`${assignment.description}`}
                  />
                  Due Date: {format(new Date(assignment.dueDate), 'HH:mm dd/MM/yyyy')}
                </Link>
              </List.Item>
            )}
          />
        </div>
      </div>
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
