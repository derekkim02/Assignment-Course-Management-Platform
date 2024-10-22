import React from 'react';
import { Layout, Row, Col, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useEnrollments } from '../../../queries';
import { textAlign } from '@mui/system';

const { Content } = Layout;
const { Meta } = Card;
const { Title } = Typography;

type Term = 'T1' | 'T2' | 'T3' | 'T0';

const termOrder: Record<Term, number> = {
  T1: 1,
  T2: 2,
  T3: 3,
  T0: 0 // Assuming T0 is the latest term
};

interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  teachingAssignments: {
    termYear: number;
    termTerm: string;
  }[];
  markingAssignments: any[];
}

const sortTerms = (a: { termYear: number; termTerm: Term }, b: { termYear: number; termTerm: Term }) => {
  if (a.termYear !== b.termYear) {
    return b.termYear - a.termYear;
  }
  return termOrder[b.termTerm] - termOrder[a.termTerm];
};

const groupCoursesByTerm = (courses: Course[]) => {
  const groupedCourses: { [key: string]: Course[] } = {};

  courses.forEach((course) => {
    const term = course.teachingAssignments[0];
    const termKey = `${term.termYear}-${term.termTerm}`;

    if (!groupedCourses[termKey]) {
      groupedCourses[termKey] = [];
    }

    groupedCourses[termKey].push(course);
  });

  return groupedCourses;
};

const CoursesSection: React.FC = () => {
  const { data: enrollments, isLoading, error } = useEnrollments('marker');

  const groupedCourses = enrollments ? groupCoursesByTerm(enrollments) : {};
  const sortedTerms = Object.keys(groupedCourses).sort((a, b) => {
    const [aYear, aTerm] = a.split('-');
    const [bYear, bTerm] = b.split('-');
    return sortTerms({ termYear: parseInt(aYear), termTerm: aTerm as Term }, { termYear: parseInt(bYear), termTerm: bTerm as Term });
  });

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        {sortedTerms.map((termKey) => {
          const [termYear, termTerm] = termKey.split('-');
          return (
            <div key={termKey}>
              <Title level={3}>
              {termYear}{termTerm}
              </Title>
              <Row gutter={[32, 32]} wrap>
                {groupedCourses[termKey].map((course: Course) => (
                  <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                    <Link to={`${termYear}|${termTerm}|${course.id}`}>
                      <Card hoverable style={{ marginBottom: '20px' }}>
                        <Meta title={course.code} description={course.description} />
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}
      </Content>
    </Layout>
  );
};

export default CoursesSection;
