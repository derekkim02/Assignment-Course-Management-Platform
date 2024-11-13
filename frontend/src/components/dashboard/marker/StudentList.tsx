import React, { useState, useEffect } from 'react';
import { Layout, Typography, List, Card, Input, Pagination, Spin } from 'antd';
import { useUsers } from '../../../queries';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface User {
  zid: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

const StudentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data: users = [], refetch: refetchUsers } = useUsers();
  const [filteredStudents, setFilteredStudents] = useState(users);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Runs when users is loaded and on page load
  useEffect(() => {
    handlePageChange(1, pageSize);
  }, [users]);

  // Handle pagination
  const handlePageChange = (page: number, size?: number) => {
    refetchUsers();
    setCurrentPage(page);
    // Use the provided size or fall back to current pageSize
    const newSize = size || pageSize;
    if (size) {
      setPageSize(size);
    }

    const filtered = users.slice(
      (page - 1) * newSize,
      page * newSize
    );
    setFilteredStudents(filtered);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered: User[] = users.filter((student: User) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.zid.toString().includes(query)
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
          renderItem={(student: User) => (
            <List.Item>
              <Card title={`${student.firstName} ${student.lastName}`}>
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
          total={users.length}
          align="center"
          onChange={handlePageChange}
        />;
      </Content>
    </Layout>
  );
};

export default StudentList;
