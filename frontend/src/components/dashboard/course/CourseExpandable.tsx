import React from 'react';
import { Collapse, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Panel } = Collapse;

interface CourseExpandableProps {
  name: string;
  role: string;
  useFetch: () => { data: any; isLoading: boolean; error: any };
}

const termOrder = ['T1', 'T2', 'T3'];

const CourseExpandable: React.FC<CourseExpandableProps> = ({ name, role, useFetch }) => {
  const { data, isLoading, error } = useFetch();

  // Sort and group the data by year and term in descending order
  const groupedData = data?.slice().sort((a: any, b: any) => {
    if (a.year !== b.year) {
      return b.year - a.year; // Sort by year in descending order
    }
    return termOrder.indexOf(b.term) - termOrder.indexOf(a.term); // Sort by term in descending order
  }).reduce((acc: any, item: any) => {
    const termKey = `${item.year}${item.term}`;
    if (!acc[termKey]) {
      acc[termKey] = [];
    }
    acc[termKey].push(item);
    return acc;
  }, {});

  return (
    <Collapse defaultActiveKey={['1']} style={{ marginTop: '20px' }}>
      <Panel header={name} key="1">
        {isLoading && <p>Loading...</p>}
        {groupedData && Object.keys(groupedData).map((termKey) => (
          <div key={termKey}>
            <h3>{termKey}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {groupedData[termKey].map((item: any, index: number) => (
                <Link to={`${role}/${item.enrolmentId}`} key={index}>
                    <Card
                    title={item.courseCode}
                    style={{ width: 300 }}
                    hoverable
                    >
                        <p>{item.courseName}</p>
                    </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </Panel>
    </Collapse>
  );
};

export default CourseExpandable;
