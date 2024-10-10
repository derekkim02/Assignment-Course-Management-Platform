import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Row, Col, Card, Calendar as AntdCalendar, Badge, Modal, Popover } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { Content } = Layout;

interface Event {
  date: string;
  type: 'success' | 'warning' | 'error';
  content: string;
}

const events: Event[] = [
  { date: '2023-10-10', type: 'success', content: 'Assignment 1 Due' },
  { date: '2023-10-15', type: 'warning', content: 'Midterm Exam' },
  { date: '2023-10-15-18', type: 'warning', content: 'Midterm Exam' },
  { date: '2023-10-20', type: 'error', content: 'Project Deadline' },
];

const getListData = (value: Dayjs) => {
  const dateString = value.format('YYYY-MM-DD');
  return events.filter(event => event.date === dateString);
};

// Make this mobile responsive.
const CalendarSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call handler right away so state gets updated with initial window size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDateClick = (value: Dayjs) => {
    setSelectedDate(value);
    setIsModalVisible(true);
  };

  const cellRender = (current: Dayjs, info: { type: string }) => {
    if (info.type === 'date') {
      const listData = getListData(current);
      const content = (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listData.map(item => (
            <li key={item.content} style={{ marginBottom: 4 }}>
              <Badge status={item.type} text={item.content} />
            </li>
          ))}
        </ul>
      );
      return (
        <Popover content={content} title="Events">
          <div
            onClick={() => handleDateClick(current)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              height: '100%',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {listData.map(item => (
              <Badge key={item.content} status={item.type} text={item.content} style={{ width: '100%' }} />
            ))}
          </div>
        </Popover>
      );
    }
    return null;
  };

  return (
    <Layout>
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          backgroundColor: '#fff',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Card title="Calendar" bordered={false}>
              <AntdCalendar cellRender={cellRender} fullscreen={true} />
            </Card>
          </Col>
        </Row>
      </Content>
      <Modal
        title={`Events on ${selectedDate?.format('YYYY-MM-DD')}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {selectedDate && getListData(selectedDate).map(event => (
            <li key={event.content} style={{ marginBottom: 4 }}>
              <Badge status={event.type} text={event.content} />
            </li>
          ))}
        </ul>
      </Modal>
    </Layout>
  );
};

export default CalendarSection;