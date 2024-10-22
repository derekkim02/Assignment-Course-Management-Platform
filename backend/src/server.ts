import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter';
import studentRouter from './routes/studentRouter';
import tutorRouter from './routes/tutorRouter';
import lecturerRouter from './routes/lecturerRouter';
import prisma from './prismaClient';
import { verifyToken } from './jwtUtils';


const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/lecturer', lecturerRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/api/courses', verifyToken, async (req, res) => {
  try {
    // TODO: Find courses based on which role and stuff.
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});


