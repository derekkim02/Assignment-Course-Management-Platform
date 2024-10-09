import React, { useState, CSSProperties } from 'react';
import {
  LockOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Tabs, Button, Form, Input } from 'antd';
import { useAuth } from './AuthContext'; // Adjust the import path as necessary
import unswLoginLogo from '../../assets/unswLoginLogo.png'; // Ensure the path is correct
import { useNavigate, useLocation } from 'react-router-dom'; // Import React Router hooks

type LoginType = 'login' | 'register';

const containerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

const formContainerStyle: CSSProperties = {
  maxWidth: 380,
  width: '100%',
  padding: '30px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Increased the offset and blur radius
  borderRadius: '8px',
  backgroundColor: '#fff',
};

const logoStyle: CSSProperties = {
  display: 'block',
  margin: '0 auto 20px',
  width: '200px',
  height: 'auto',
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginType, setLoginType] = useState<LoginType>(
    (location.pathname.includes('register') ? 'register' : 'login') as LoginType
  );

  const onFinish = (values: any) => {
    console.log('Received values:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleTabChange = (activeKey: string) => {
    setLoginType(activeKey as LoginType);
    navigate(`/${activeKey}`);
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <img src={unswLoginLogo} alt="UNSW Login Logo" style={logoStyle} />
        <Form
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Tabs
            centered
            activeKey={loginType}
            onChange={handleTabChange}
          >
            <Tabs.TabPane key={'login'} tab={'Login'} />
            <Tabs.TabPane key={'register'} tab={'Register'} />
          </Tabs>
          {loginType === 'login' && (
            <>
              <Form.Item
                name="zid"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your zid!',
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined className="prefixIcon" />}
                  placeholder="zID"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="prefixIcon" />}
                  placeholder="Password"
                />
              </Form.Item>
            </>
          )}
          {loginType === 'register' && (
            <>
              <Form.Item
                name="zid"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your zid!',
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined className="prefixIcon" />}
                  placeholder="zID"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="prefixIcon" />}
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item
                name="password-confirm"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="prefixIcon" />}
                  placeholder="Password Confirm"
                />
              </Form.Item>
            </>
          )}
          <Button type="primary" htmlType="submit" block>
            {loginType === 'login' ? 'Login' : 'Register'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;