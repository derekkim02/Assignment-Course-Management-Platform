// frontend/src/components/dashboard/AdminSettings.tsx
import React from 'react';
import { Layout, Table, Button, Select, message } from 'antd';
import { useUsers } from '../../queries';
import Cookies from 'js-cookie';

const { Content } = Layout;
const { Option } = Select;

interface User {
  id: number;
  email: string;
  role: string;
  isAdmin: boolean;
}

const AdminSettings: React.FC = () => {
  const token = Cookies.get('token') || '';
  const role = 'admin'; // Assuming the admin role is required to fetch users
  const { data: users, isLoading, refetch } = useUsers(token, role);

  const handleRoleChange = async (id: number, role: string, isAdmin: boolean) => {
    try {
      await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role, isAdmin })
      });
      message.success('User role updated successfully');
      refetch();
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text: string, record: User) => (
        <Select
          defaultValue={text}
          onChange={(value) => handleRoleChange(record.id, value, record.isAdmin)}
        >
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
      )
    },
    {
      title: 'Admin',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (text: boolean, record: User) => (
        <Button
          type={text ? 'primary' : 'default'}
          onClick={() => handleRoleChange(record.id, record.role, !text)}
        >
          {text ? 'Revoke Admin' : 'Grant Admin'}
        </Button>
      )
    }
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Table
          dataSource={users || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Content>
    </Layout>
  );
};

export default AdminSettings;
