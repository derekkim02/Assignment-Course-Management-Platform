import express from 'express';
import { createAssessment } from './assessments';

// Example functions

// async function main() {
//   // Example query
//   const allUsers = await prisma.user.findMany();
//   console.log(allUsers);
// }

// main()
//   .catch(e => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

/// AUTHENTICATION
app.post('/api/auth/login', (req, res) => {
  res.json({ token: '1234' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Registered' });
});

/// HOMEPAGES
app.get('/api/student/homepage', (req, res) => {
  res.json({ user: { name: 'John Doe' } });
});

app.get('/api/tutor/homepage', (req, res) => {
  res.json({ user: { name: 'Jane Doe' } });
});

app.get('/api/lecturer/homepage', (req, res) => {
  res.json({ user: { name: 'Andrew Taylor' } });
});

/// ASSIGNMENT MANAGEMENT
app.post('/api/lecturer/create-assignment', async (req, res) => {
  const {lecturerId, title, description, dueDate, term, courseID, } = req.body;
  try {
    const newAssignment = await createAssessment(lecturerId, title, description, dueDate, term, courseID);
    res.json(newAssignment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.put('/api/lecturer/update-assignment', (req, res) => {
  res.json({ message: 'Course updated' });
});

app.delete('/api/lecturer/delete-assignment', (req, res) => {
  res.json({ message: 'Course deleted' });
});

app.get('/api/view-assignments', (req, res) => {
  res.json({ assignments: [{ title: 'Assignment 1' }] });
});

app.get('/api/lecturer/upload-student-csv', (req, res) => {
  const csvFile = req.body;
  res.json({ message: 'Student database updated' });
});

/// STUDENT ASSIGNMENT MANAGEMENT
app.post('/api/student/submit-assignment', (req, res) => {
  res.json({ message: 'Assignment submitted' });
});

app.get('/api/student/view-marks', (req, res) => {
  res.json({ assignment: { title: 'Assignment 1' } });
});

/// TUTOR ASSIGNMENT MANAGEMENT

app.put('/api/tutor/edit-mark', (req, res) => {
  res.json({ assignments: [{ title: 'Assignment 1' }] });
});

app.get('/api/tutor/view-assignments', (req, res) => {
  res.json({ assignments: [{ title: 'Assignment 1' }] });
});

app.get('/api/tutor/student-search', (req, res) => {
  res.json({ assignment: { title: 'Assignment 1' } });
});
