import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '@/lib/constants';
import { generateToken } from '@/lib/generateToken';
import serverErrorHandler from '@/lib/serverErrorHandler';
import { API_STATUS, APIError, PERMISSION } from '@/types/general';
import { SignupResponse } from '@/types/server';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

const prisma = new PrismaClient();

export default async function signup(
	req: NextApiRequest,
	res: NextApiResponse<SignupResponse | APIError>,
) {
	serverErrorHandler('POST', req, res, async() => {
		const { username, password, isAdmin } = req.body;

		//username validation
		try {
			const regex = /^[a-zA-Z0-9.,_-]+$/;
			if (!username) {
				throw new Error('Username cannot be left blank');
			}
			if (username.length < MIN_USERNAME_LENGTH) {
				throw new Error(`Username must be at least ${MIN_USERNAME_LENGTH} characters long`);
			}
			if (username.length > MAX_USERNAME_LENGTH) {
				throw new Error(`Username must be at most ${MAX_USERNAME_LENGTH} characters long`);
			}
			if (!regex.test(username)) {
				throw new Error('Username must only contain alphanumerical characters and: . , _ -');
			}
		} catch (error){
			if (error instanceof Error){
				res.status(API_STATUS.BAD_REQUEST).json({
					status: API_STATUS.BAD_REQUEST,
					message: error.message
				});
			}
			else {
				res.status(API_STATUS.BAD_REQUEST).json({
					status: API_STATUS.BAD_REQUEST,
					message: 'An unknown error occured during string validation'
				});
			}
			return;
		}
        
		//password validation
		try {
			if (!password) {
				throw new Error('Password cannot be left blank');
			}
			if (password.length < MIN_PASSWORD_LENGTH) {
				throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
			}
			if (password.length > MAX_PASSWORD_LENGTH) {
				throw new Error(`Password must be at most ${MAX_PASSWORD_LENGTH} characters long`);
			}
			if (/\s/.test(password)) {
				throw new Error('Password cannot contain spaces');
			}
		} catch (error){
			if (error instanceof Error){
				res.status(API_STATUS.BAD_REQUEST).json({
					status: API_STATUS.BAD_REQUEST,
					message: error.message
				});
			}
			else {
				res.status(API_STATUS.BAD_REQUEST).json({
					status: API_STATUS.BAD_REQUEST,
					message: 'An unknown error occured during string validation'
				});
			}
			return;
		}

		//duplicate checking
		const duplicate = await prisma.user.findFirst({
			where: { username }
		});

		if (duplicate) {
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Username already exists'
			});
			return;
		}

		let hashedPassword: string = '';

		if (password) {
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			hashedPassword = await bcrypt.hash(password, salt);
		}

		const user = {
			...await prisma.user.create({
				data: {
					username,
					password: hashedPassword,
					permissions: isAdmin ? PERMISSION.Admin : PERMISSION.User,
					settings: {
						create: {

						}
					}
				}
			}),
			chats: []
		};

		const token = generateToken(user.id);

		res.status(API_STATUS.OK).json({ user, token });

	});
}