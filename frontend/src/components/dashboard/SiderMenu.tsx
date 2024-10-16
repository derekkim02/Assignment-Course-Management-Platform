import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, FileTextOutlined, CalendarOutlined, BookOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarMenuProps {
  isMobile: boolean;
  children?: React.ReactNode;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isMobile, children }) => {
  const menuItems = [
    { key: '1', icon: <FileTextOutlined />, path: '/dashboard/submissions', label: 'Submissions' },
    { key: '2', icon: <BookOutlined />, path: '/dashboard/courses', label: 'Courses' },
    { key: '3', icon: <CalendarOutlined />, path: '/dashboard/calendar', label: 'Calendar' },
    { key: '4', icon: <UserOutlined />, path: '/dashboard/student-list', label: 'Students' }
  ];

  const location = useLocation();

  const getSelectedKey = () => {
    const currentItem = menuItems.find(item => location.pathname.includes(item.path));
    return currentItem ? [currentItem.key] : ['1'];
  };

  return (
    <Sider width={isMobile ? '100%' : '250px'} style={{ height: 'auto' }}>
      <Menu mode={'inline'} selectedKeys={getSelectedKey()} style={{ borderRight: 0 }}>
        {menuItems.map(item => (
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
