import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from './prismaClient';
import { User } from '@prisma/client';

const secretKey = process.env.JWT_SECRET || 'capstone-arat-project';

export const generateToken = (email: string, isAdmin: boolean): string => {
	return jwt.sign({ email, isAdmin }, secretKey, { expiresIn: '7 days' });
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		res.status(401).json({ message: 'No token provided' });
		return;
	}
	jwt.verify(token, secretKey, (err, decoded) => {
		if (err) {
			res.status(403).json({ message: 'Failed to authenticate token' });
			return;
		}
		req.userEmail = (decoded as JwtPayload).email;
		next();
	});
}

export const checkIgiveAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

	  if (!user.isAdmin) {
		res.status(403).json({ message: 'Access denied. Admins only.' });
		return;
	  }

	  next();
	} catch (err) {
	  res.status(403).json({ message: `Failed to authenticate token ${err}` });
	}
};

// This it will always check if the token is valid, there fore a user will always be returned.
export const getUserFromToken = async (req: Request): Promise<User> => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, secretKey) as { email: string };
  const email = decoded.email;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  return user!;
};
