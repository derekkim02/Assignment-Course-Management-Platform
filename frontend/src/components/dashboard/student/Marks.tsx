import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { useMarks } from '../../../queries';

const Marks: React.FC = () => {
  const { data: marks } = useMarks();
  return (
    <Layout>
      <h1>Marks</h1>
      <Button type="primary" onClick={() => console.log(marks)} style={{ marginBottom: '20px', width: '120px', alignSelf: 'center', marginRight: '10px' }}>
        Check Marks
      </Button>
      {/* {marks && marks.map((mark) => (
        <div key={mark.id}>
          <h2>{mark.title}</h2>
          <p>{mark.mark}</p>
        </div>
      ))} */}
    </Layout>
  );
};

export default Marks;
