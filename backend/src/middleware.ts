import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { secretKey } from './server';
import { prisma } from './server';


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

// Middleware to check if the user is an igiveadmin
const checkIgiveAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { email: string };
    const user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });

    if (!user) {
      res.status(403).json({ message: 'Access denied. User not found.' });
      return;
    }

    const isAdmin = await prisma.admin.findUnique({
      where: { zid: user.zid }
    });

    if (!isAdmin) {
      res.status(403).json({ message: 'Access denied. Admins only.' });
      return;
    }

    next();
  } catch (err) {
    res.status(403).json({ message: 'Failed to authenticate token' });
  }
};

export { verifyToken, checkIgiveAdmin };