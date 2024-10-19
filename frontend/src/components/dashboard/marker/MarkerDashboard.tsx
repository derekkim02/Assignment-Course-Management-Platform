// frontend/src/components/dashboard/student/MarkerDashboard.tsx
import React, { useEffect, useState, ReactNode } from 'react';
import { Layout } from 'antd';
import Navbar from '../Navbar';
import SidebarMenu from '../SiderMenu';

const { Content } = Layout;

interface MarkerDashboardProps {
  content: ReactNode;
}

const MarkerDashboard: React.FC<MarkerDashboardProps> = ({ content }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout style={{ flexDirection: isMobile ? 'column' : 'row' }}>
        <SidebarMenu isMobile={isMobile} />
        <Content>
          {content}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MarkerDashboard;
