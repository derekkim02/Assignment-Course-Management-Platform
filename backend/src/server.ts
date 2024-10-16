import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Prisma, PrismaClient } from '@prisma/client';
import { createAssessment } from './assessments';

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

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    next();
  });
};

/// AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: email }
  });

  // Validate username and password
  if (user && user.password === password) {
    const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '7 days' });
    res.json({ token });
  } else { 
    res.status(400).json({ error: 'Invalid username or password '});
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/api/auth/register', async (req, res) => {
  const {firstName, lastName, email, password, cpassword} = req.body;
  if (password !== cpassword) {
    res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      }
    });
    res.status(201).json({ message: 'Account created' });
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