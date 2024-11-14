import React from 'react';
import { Modal, Form, Upload, message, Collapse } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Tar from 'tar-js';
import { config } from '../../../../config';
import pako from 'pako';
import Cookies from 'js-cookie';

const { Panel } = Collapse;

interface UploadSubmissionModalProps {
  assignmentId: string;
  isModalVisible: boolean;
  closeModal: () => void;
  refetchAssignment: () => void;
  refetchSubmission: () => void;
}

const UploadSubmissionModal: React.FC<UploadSubmissionModalProps> = ({ assignmentId, isModalVisible, closeModal, refetchAssignment, refetchSubmission }) => {
  const [form] = Form.useForm();

  const [results, setResults] = React.useState([]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.file;

      if (fileList && fileList.length > 0) {
        const tarball = await createTarGz(fileList);
        const testCases = await sendTarballToBackend(tarball);
        form.resetFields();
        refetchAssignment();

        console.log(testCases.results);
        setResults(testCases.results);
        message.success('Submission uploaded successfully!');
        refetchSubmission();
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
    const token = Cookies.get('token') || '';
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
      return result;
    } catch (error) {
      console.error('Error uploading tarball:', error);
      throw error;
    }
  };

  const closeModalWrapper = () => {
    form.resetFields();
    setResults([]);
    closeModal();
  };

  return (
    <Modal
      title="Add Submission"
      open={isModalVisible}
      onOk={handleOk}
      onCancel={closeModalWrapper}
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

      {results.length > 0 && (
        <div>
          <h3>Submission Results</h3>
          <Collapse>
          {results.map((result: any, index) => (
            <Panel
              header={<span style={{ color: result.passed ? 'green' : 'red' }}>{`Test Case ${index + 1}`}</span>}
              key={index}
            >
              <p>Output: {result.message}</p>
            </Panel>
          ))}
        </Collapse>

        </div>
      )}
    </Modal>
  );
};

export default UploadSubmissionModal;
