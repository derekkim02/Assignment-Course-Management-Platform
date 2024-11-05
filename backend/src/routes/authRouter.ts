import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

/**
 * @route POST api/auth/login
 * @desc Login user
 * @body {string} email - Email of the user
 * @body {string} password - Password of the user
 * @returns {object} 200 - Token
 * @returns {string} 200.token - JWT token
 */
router.post('/login', login);

/**
 * @route POST api/auth/register
 * @desc Register user
 * @body {string} firstName - First name of the user
 * @body {string} lastName - Last name of the user
 * @body {string} email - Email of the user
 * @body {string} password - Password of the user
 * @body {string} cpassword - Confirm password of the user
 * @returns {object} 201 - Message
 * @returns {string} 201.message - Account created
 */
router.post('/register', register);

export default router;
