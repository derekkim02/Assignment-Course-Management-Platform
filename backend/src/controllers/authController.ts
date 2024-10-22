import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { generateToken } from '../jwtUtils';
import prisma from '../prismaClient';

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
		
			const token = generateToken(email, Boolean(isAdmin));
			res.status(200).json({ token });
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
}
