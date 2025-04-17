import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '@/lib/constants';
import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError, PERMISSION } from '@/types/general';
import { PopulatedUser } from '@/types/populations';
import { CreateUserResponse } from '@/types/server';

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

export default async function create_user(
	req: NextApiRequest,
	res: NextApiResponse<CreateUserResponse | APIError>,
) {
	serverErrorHandler('POST', req, res, async() => {
		const token = verifyToken(req.headers.authorization, res);
                        
		if (!token){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Authentication failed'
			});
			return;
		}

		const user = await getPopulatedUser(prisma, {id: token.id});
        
		if (!user){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Request token is not from a valid user'
			});
			return;
		}

		if (user.permissions !== PERMISSION.Admin){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Request token is not from an admin'
			});
			return;
		}

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

		const newUser: PopulatedUser = {
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

		res.status(API_STATUS.OK).json({ user: newUser });
	});
}