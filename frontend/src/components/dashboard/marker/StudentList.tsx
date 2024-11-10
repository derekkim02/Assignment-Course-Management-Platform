import React, { useState, useEffect } from 'react';
import { Layout, Typography, List, Card, Input, Pagination } from 'antd';

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
  { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', zid: 'z4433221' },
  { id: 5, name: 'Charlie Davis', email: 'charlie.davis@example.com', zid: 'z5566778' },
  { id: 6, name: 'Diana Evans', email: 'diana.evans@example.com', zid: 'z9988776' },
  { id: 7, name: 'Evan Foster', email: 'evan.foster@example.com', zid: 'z3344556' },
  { id: 8, name: 'Fiona Green', email: 'fiona.green@example.com', zid: 'z2233445' },
  { id: 9, name: 'George Harris', email: 'george.harris@example.com', zid: 'z6677889' },
  { id: 10, name: 'Hannah White', email: 'hannah.white@example.com', zid: 'z7788990' },
  { id: 11, name: 'Ian King', email: 'ian.king@example.com', zid: 'z8899001' },
  { id: 12, name: 'Jack Lee', email: 'jack.lee@example.com', zid: 'z9900112' },
  { id: 13, name: 'Karen Martinez', email: 'karen.martinez@example.com', zid: 'z0011223' },
  { id: 14, name: 'Liam Nelson', email: 'liam.nelson@example.com', zid: 'z1122334' },
  { id: 15, name: 'Mia Perez', email: 'mia.perez@example.com', zid: 'z2233445' },
  { id: 16, name: 'Noah Quinn', email: 'noah.quinn@example.com', zid: 'z3344556' }

  // Add more dummy students as needed
];

const StudentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(dummyStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Runs on page load
  useEffect(() => {
    handlePageChange(1, pageSize);
  }, []);

  // Handle pagination
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    // Use the provided size or fall back to current pageSize
    const newSize = size || pageSize;
    if (size) {
      setPageSize(size);
    }

    const filtered = dummyStudents.slice(
      (page - 1) * newSize,
      page * newSize
    );
    setFilteredStudents(filtered);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = dummyStudents.filter(student =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.zid.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
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
        <Pagination
          defaultCurrent={1}
          current={currentPage}
          pageSize={pageSize}
          total={dummyStudents.length}
          align="center"
          onChange={handlePageChange}
        />;
      </Content>
    </Layout>
  );
};

export default StudentList;
