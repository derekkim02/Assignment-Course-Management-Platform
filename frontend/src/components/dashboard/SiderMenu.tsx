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

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isMobile, children }) => {
  const auth = useAuth();
  const isAdmin = auth.isIGiveAdmin;
  const location = useLocation();

  const menuItems = [
    { key: '1', icon: <FileTextOutlined />, path: '/dashboard/submissions', label: 'Submissions', condition: true },
    { key: '2', icon: <BookOutlined />, path: '/dashboard/courses', label: 'Courses', condition: true },
    { key: '3', icon: <CalendarOutlined />, path: '/dashboard/calendar', label: 'Calendar', condition: true },
    { key: '4', icon: <UserOutlined />, path: '/dashboard/student-list', label: 'Students', condition: true },
    { key: '5', icon: <SettingOutlined />, path: '/dashboard/admin', label: 'Admin Settings', condition: isAdmin } // Admin-only item
  ];

  const filteredMenuItems = menuItems.filter(item => item.condition);

  const getSelectedKey = () => {
    const currentItem = filteredMenuItems.find(item => location.pathname.includes(item.path));
    return currentItem ? [currentItem.key] : ['1'];
  };

  return (
    <Sider width={isMobile ? '100%' : '250px'} style={{ height: 'auto' }}>
      <Menu mode={'inline'} selectedKeys={getSelectedKey()} style={{ borderRight: 0 }}>
        {filteredMenuItems.map(item => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
        {children}
      </Menu>
    </Sider>
  );
};

export default SidebarMenu;
