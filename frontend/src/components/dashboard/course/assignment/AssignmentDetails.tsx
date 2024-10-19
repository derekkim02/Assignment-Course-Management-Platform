import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Card, Button, Modal, Form, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  date: string;
  grade: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  feedback: string;
  submissions: Submission[];
}

const AssignmentDetails: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  // Dummy data for assignment details
  const assignment: Assignment = {
    id: Number(assignmentId),
    title: `Assignment ${assignmentId}`,
    description: `This is the detailed description for Assignment ${assignmentId}.`,
    dueDate: '2023-10-01',
    feedback: 'Overall great job on this assignment!',
    submissions: [
      { id: 1, date: '2023-09-15', grade: 'A' },
      { id: 2, date: '2023-09-20', grade: 'B+' }
    ]
  };

  const [submissions, setSubmissions] = useState<Submission[]>(assignment.submissions);
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
      const newSubmission: Submission = {
        id: submissions.length + 1,
        date: dayjs().format('YYYY-MM-DD'),
        grade: 'Pending'
      };
      setSubmissions([...submissions, newSubmission]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Submission uploaded successfully!');
    });
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>{assignment.title}</Title>
        <Paragraph>{assignment.description}</Paragraph>
        <Paragraph>Due Date: {assignment.dueDate}</Paragraph>
        <Title level={3}>Overall Feedback</Title>
        <Paragraph>{assignment.feedback}</Paragraph>
        <Title level={3}>Past Submissions</Title>
        <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
          Add Submission
        </Button>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={submissions}
          renderItem={submission => (
            <List.Item>
              <Card title={`Submission ${submission.id}`}>
                <p>Date: {submission.date}</p>
                <p>Grade: {submission.grade}</p>
              </Card>
            </List.Item>
          )}
        />
      </Content>

      <Modal
        title="Add Submission"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="file"
            label="Upload File"
            valuePropName="fileList"
            getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: 'Please upload a file' }]}
          >
            <Upload.Dragger name="files" beforeUpload={() => false}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for a single or bulk upload.</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AssignmentDetails;
