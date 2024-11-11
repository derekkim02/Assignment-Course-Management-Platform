import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Card, Button, Modal, Form, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Tar from 'tar-js';
import pako from 'pako';
import dayjs from 'dayjs';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import { bannerStyle, footerLineStyle } from '../styles';

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
  const { role, enrolmentId, assignmentId } = useParams<{ role: string, enrolmentId: string, assignmentId: string }>();

  const token = Cookies.get('token') || '';

  // Dummy data for assignment details
  const assignment: Assignment = {
    id: Number(assignmentId),
    title: `Assignment ${assignmentId}`,
    description: `This is the detailed description for Assignment ${assignmentId}.`,
    dueDate: '2023-10-01',
    feedback: 'Overall great job on this assignment!',
    submissions: [
      { id: 1, date: '2023-09-15', grade: 'A' },
      { id: 2, date: '2023-09-20', grade: 'B+' },
    ],
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.file;

      if (fileList && fileList.length > 0) {
        const tarball = await createTarGz(fileList);
        await sendTarballToBackend(tarball);
        const newSubmission: Submission = {
          id: submissions.length + 1,
          date: dayjs().format('YYYY-MM-DD'),
          grade: 'Pending'
        };
        setSubmissions([...submissions, newSubmission]);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Submission uploaded successfully!');
      } else {
        message.error('Please upload at least one file.');
      }
    } catch (error) {
      console.error('Failed to create tarball:', error);
      message.error('Failed to create tarball.');
    }
  };

  const createTarGz = (fileList: any[]) => {
    return new Promise<Uint8Array>((resolve, reject) => {
      const tar = new Tar();
      let filesProcessed = 0;

      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            const buffer = new Uint8Array(e.target.result as ArrayBuffer);
            tar.append(file.name, buffer);
            filesProcessed += 1;

            if (filesProcessed === fileList.length) {
              const tarball = tar.out;
              const compressed = pako.gzip(tarball);
              resolve(compressed);
            }
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.originFileObj);
      });
    });
  };

  const sendTarballToBackend = async (tarball: Uint8Array) => {
    const blob = new Blob([tarball], { type: 'application/gzip' });
    const formData = new FormData();
    formData.append('submission', blob, 'submission.tar.gz');
    try {
      const response = await fetch(`${config.backendUrl}/api/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload tarball');
      }
      const result = await response.json();
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Error uploading tarball:', error);
      throw error;
    }
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <div style={bannerStyle}>
        <div style={{ paddingTop: '10px', paddingLeft: '25px' }}>
          <Title level={1}>{assignment.title}</Title>
        </div>

        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>{assignment.description}</Paragraph>
      </div>

      <Title level={3}>Submissions</Title>
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
            <Upload.Dragger name="files" multiple={true} beforeUpload={() => false}>
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
