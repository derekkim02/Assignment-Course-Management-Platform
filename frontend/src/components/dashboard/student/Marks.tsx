import React from 'react';
import { Layout, Typography, List, Card, Descriptions } from 'antd';
import { useMarks } from '../../../queries';

const { Content } = Layout;
const { Title } = Typography;

interface Marks {
  assignmentName: string;
  term: string;
  year: string;
  autoMark: number;
  styleMark: number;
  latePenalty: number;
  finalMark: number;
  markerComments: string;
}

const Marks: React.FC = () => {
  const { data: marks } = useMarks();
  return (
    <Layout>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>Your Results</Title>
        <List
          grid={{ column: 1 }}
          dataSource={marks}
          renderItem={(mark: Marks) => (
            <List.Item style={{ padding: 0 }}>
              <Card
                title={`${mark.assignmentName} (${mark.term} ${mark.year})`}
                style={{ width: '100%', margin: 0 }}
              >
                <Descriptions column={4} layout="vertical" bordered>
                  <Descriptions.Item label="Auto Mark">{mark.autoMark}</Descriptions.Item>
                  <Descriptions.Item label="Style Mark">{mark.styleMark}</Descriptions.Item>
                  <Descriptions.Item label="Late Penalty">{mark.latePenalty}</Descriptions.Item>
                  <Descriptions.Item label="Final Mark">{mark.finalMark}</Descriptions.Item>
                  <Descriptions.Item label="Marker Comments">{mark.markerComments}</Descriptions.Item>
                </Descriptions>
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default Marks;
