import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Prisma, PrismaClient } from '@prisma/client';
import { createAssessment } from './assessments';
import { downloadSubmissions } from './downloadSubmissions';

import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const prisma = new PrismaClient();
const secretKey = 'capstone-arat-project';

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
app.use(bodyParser.json());
app.use(cors());

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

/// AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  console.log("Login request received");
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: email }
  });

  // Validate username and password
  if (user && user.password === password) {
    const isAdmin = await prisma.admin.findUnique({
      where: { zid: user.zid }
    });

    const token = jwt.sign({ email: user.email, isAdmin: Boolean(isAdmin) }, secretKey, { expiresIn: '7 days' });
    res.json({ token });
  } else {
    res.status(400).json({ error: 'Invalid username or password'});
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/api/auth/register', async (req, res) => {
  const {firstName, lastName, email, password, cpassword} = req.body;
  console.log("Register request received");
  console.log(password, cpassword);
  if (password !== cpassword) {
    res.status(400).json({ error: 'Passwords do not match' });
    return;
  }

  try {
    const userCount = await prisma.user.count();
    const user = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      }
    });
    if (userCount === 0) {
      await prisma.admin.create({
        data: {
          zid: user.zid
        }
      });
    }
    const token = jwt.sign({ email: email }, secretKey, { expiresIn: '7 days' });
    res.status(201).json({ token, message: 'Account created' });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        res.status(400).json({ error: 'Email already exists' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/// HOMEPAGES
app.get('/api/courses', verifyToken, async (req, res) => {
  try {
    // TODO: Find courses based on which role and stuff.
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch (e) {
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

app.get('/api/student/download-submissions', async (req, res) => {
  const { groupId, assignmentId } = req.body;
  try {
    const submissions = await downloadSubmissions(groupId, assignmentId);
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
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