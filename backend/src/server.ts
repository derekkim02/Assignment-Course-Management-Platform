import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter';
import studentRouter from './routes/studentRouter';
import tutorRouter from './routes/tutorRouter';
import lecturerRouter from './routes/lecturerRouter';
import adminRouter from './routes/adminRouter';
import enrollmentsRouter from './routes/enrollmentsRouter';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/lecturer', lecturerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/enrollments', enrollmentsRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
