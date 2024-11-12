import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, List, Button, Modal, Form, Upload, message, Spin, Skeleton } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Tar from 'tar-js';
import pako from 'pako';
import dayjs from 'dayjs';
import { config } from '../../../../config';
import Cookies from 'js-cookie';
import { bannerStyle, footerLineStyle, listContainerStyle } from '../styles';
import { useAssignment } from '../../../../queries';
import { format } from 'date-fns';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Submission {
  id: number;
  submissionTime: string;
}

const AssignmentDetails: React.FC = () => {
  const { role, assignmentId } = useParams<{ role: string, enrolmentId: string, assignmentId: string }>();
  const { data: assignment, isLoading: isAssignmentLoading, error, refetch: refetchAssignment } = useAssignment(role || '', assignmentId || '');

  const token = Cookies.get('token') || '';

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
        // setIsModalVisible(false);
        form.resetFields();
        refetchAssignment();
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

  const downloadSubmission = async (submissionId: number) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/${role}/submissions/${submissionId}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission_${submissionId}.tar.gz`; // Set the desired file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download file.');
    }
  };

  if (isAssignmentLoading) {
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

  return (
    <Layout style={{ padding: '20px' }}>
      <div style={bannerStyle}>
        <div style={{ paddingTop: '10px', paddingLeft: '25px' }}>
          <Title level={1}>{assignment.assignmentName}</Title>
        </div>

        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>{assignment.description}</Paragraph>
        <div style={footerLineStyle}/>
        <Paragraph style={{ color: '#A3A3A3' }}>Due Date: {dayjs(assignment.dueDate).format('YYYY-MM-DD HH:mm')}</Paragraph>
      </div>

      <Title level={3}>Submissions</Title>
      {role === 'student' && (
        <Button type="primary" onClick={showModal} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center' }}>
          Add Submission
        </Button>
      )}
      <div style={listContainerStyle}>
        <div style={{ minWidth: '80%', maxWidth: '90%', border: '1px solid #d9d9d9', padding: '30px', borderRadius: '10px' }}>
          {role === 'student' && (
            <List
              className="demo-loadmore-list"
              loading={isAssignmentLoading}
              itemLayout="horizontal"
              dataSource={assignment.submissions}
              renderItem={(submission: Submission, index: number) => (
                <List.Item style={{ width: '100%' }}
                  actions={[
                    <a key="list-loadmore-download" onClick={() => downloadSubmission(submission.id)}>download</a>
                  ]}
                >
                  <Skeleton loading={isAssignmentLoading} active>
                    <List.Item.Meta
                    style={{ textAlign: 'left' }}
                      title={`Submission ${assignment.submissions.length - index}`} // Increment the title by 1
                      description={`Submitted on: ${format(new Date(submission.submissionTime), 'HH:mm dd/MM/yyyy')}`}
                    />
                  </Skeleton>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      <Modal
        title="Add Submission"
        open={isModalVisible}
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
