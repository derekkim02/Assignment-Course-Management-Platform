import React, { useState } from 'react';
import { Layout, Typography, List, Card, Input } from 'antd';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface Student {
  id: number;
  name: string;
  email: string;
  zid: string;
}

const dummyStudents: Student[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', zid: 'z1234567' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', zid: 'z7654321' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', zid: 'z1122334' },
  { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', zid: 'z4433221' }
  // Add more dummy students as needed
];

const StudentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(dummyStudents);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = dummyStudents.filter(student =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.zid.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>Student List</Title>
        <Search
          placeholder="Search by name, email, or zid"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={filteredStudents}
          renderItem={student => (
            <List.Item>
              <Card title={student.name}>
                <p>Email: {student.email}</p>
                <p>ZID: {student.zid}</p>
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default StudentList;
