// frontend/src/components/dashboard/SiderMenu.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, FileTextOutlined, CalendarOutlined, BookOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Sider } = Layout;

interface SidebarMenuProps {
  isMobile: boolean;
  children?: React.ReactNode;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isMobile }) => {
  const auth = useAuth();
  const isAdmin = auth.isIGiveAdmin;
  const location = useLocation();

  const menuItems = [
    { key: '1', icon: <FileTextOutlined />, path: '/dashboard/marks', label: 'Check Results', condition: true },
    { key: '2', icon: <BookOutlined />, path: '/dashboard/courses', label: 'Courses', condition: true },
    { key: '3', icon: <CalendarOutlined />, path: '/dashboard/calendar', label: 'Calendar', condition: true },
    { key: '4', icon: <UserOutlined />, path: '/dashboard/student-list', label: 'Students', condition: true },
    { key: '5', icon: <SettingOutlined />, path: '/dashboard/admin-settings', label: 'Admin Settings', condition: isAdmin } // Admin-only item
  ];

  const filteredMenuItems = menuItems.filter(item => item.condition);

  const getSelectedKey = () => {
    const currentItem = filteredMenuItems.find(item => location.pathname.includes(item.path));
    return currentItem ? [currentItem.key] : ['1'];
  };

  const items = filteredMenuItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: <Link to={item.path}>{item.label}</Link>
  }));

  return (
    <Sider width={isMobile ? '100%' : '250px'} style={{ height: 'auto', backgroundColor: 'white' }}>
      <Menu mode={'inline'} selectedKeys={getSelectedKey()} items={items} style={{ borderRight: 0 }} />
    </Sider>
  );
};

export default SidebarMenu;
