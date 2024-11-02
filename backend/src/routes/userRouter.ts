import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { getUsers } from '../controllers/usersController';

const router = express.Router();
router.use(verifyToken);

router.get('/', getUsers);

export default router;
