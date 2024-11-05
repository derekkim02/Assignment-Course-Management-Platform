import express, { Express } from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter';
import studentRouter from './routes/studentRouter';
import tutorRouter from './routes/tutorRouter';
import lecturerRouter from './routes/lecturerRouter';
import adminRouter from './routes/adminRouter';

class App {
	public server: Express;

	public constructor() {
		this.server = express();

		this.middlewares();
		this.routes();
	}

	private middlewares() {
		this.server.use(express.json());
		this.server.use(cors());
	}

	private routes() {
		this.server.use('/api/auth', authRouter);
		this.server.use('/api/student', studentRouter);
		this.server.use('/api/tutor', tutorRouter);
		this.server.use('/api/lecturer', lecturerRouter);
		this.server.use('/api/admin', adminRouter);
	}
}

export default new App().server;