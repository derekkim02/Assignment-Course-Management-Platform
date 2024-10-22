import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
