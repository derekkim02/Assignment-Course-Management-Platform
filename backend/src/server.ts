import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createAssessment } from './assessments';
import authRouter from './routes/authRouter';
import prisma from './prismaClient';

import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const secretKey = 'capstone-arat-project';

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Failed to authenticate token' });
      return;
    }
    next();
  });
};

/// HOMEPAGES
app.get('/api/courses', verifyToken, async (req, res) => {
  try {
    // TODO: Find courses based on which role and stuff.
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

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

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});