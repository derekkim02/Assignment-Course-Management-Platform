import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../prismaClient';

const secretKey = config.jwtSecretKey;

export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;
	try {
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
	} catch {
		res.status(500).json({ error: 'Internal server error' });
	}
}

export const register = async (req: Request, res: Response): Promise<void> => {
	const { firstName, lastName, email, password, cpassword } = req.body;
	
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
}
