import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { generateToken } from '../jwtUtils';
import prisma from '../prismaClient';

/**
 * Handles user login.
 *
 * @param {Request} req - The request object containing email and password in the body.
 * @param {Response} res - The response object used to send back the appropriate HTTP response.
 * @returns {Promise<void>} - A promise that resolves when the login process is complete.
 *
 * @example
 * // Example request body
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * // Example response on success
 * {
 *   "token": "jwt-token"
 * }
 *
 * // Example response on failure
 * {
 *   "error": "Invalid username or password"
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;
	try {
		const user = await prisma.user.findUnique({
			where: { email: email }
		});

		// Validate username and password
		if (user && user.password === password) {
			const token = generateToken(email, user.isAdmin);
			res.status(200).json({ token });
		} else {
			res.status(400).json({ error: 'Invalid email or password'});
		}
	} catch {
		res.status(500).json({ error: 'Internal server error' });
	}
}

/**
 * Handles user registration.
 *
 * @param {Request} req - The request object containing user details in the body.
 * @param {Response} res - The response object used to send back the appropriate HTTP response.
 * @returns {Promise<void>} - A promise that resolves when the registration process is complete.
 *
 * @example
 * // Example request body
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@example.com",
 *   "password": "password123",
 *   "cpassword": "password123"
 * }
 *
 * // Example response on success
 * {
 *   "message": "Account created"
 * }
 *
 * // Example response on failure
 * {
 *   "error": "Passwords do not match"
 * }
 *
 * // Example response on email already exists
 * {
 *   "error": "Email already exists"
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
	const { firstName, lastName, email, password, cpassword } = req.body;

	if (password !== cpassword) {
		res.status(400).json({ error: 'Passwords do not match' });
		return;
	}

	try {
		const userCount = await prisma.user.count();
		let adminUser = false;
		if (userCount === 0) {
			adminUser = true;
		}
		await prisma.user.create({
			data: {
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password,
				isAdmin: adminUser
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
}
