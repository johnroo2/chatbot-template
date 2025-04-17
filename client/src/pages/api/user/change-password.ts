import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { generateToken } from '@/lib/generateToken';
import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import { API_STATUS, APIError } from '@/types/general';
import { ChangePasswordResponse } from '@/types/server';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

const prisma = new PrismaClient();

export default async function change_password(
	req: NextApiRequest,
	res: NextApiResponse<ChangePasswordResponse | APIError>,
) {
	serverErrorHandler('POST', req, res, async() => {
		const { username, newPassword } = req.body;

		if (!username) {
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Username cannot be left blank'
			});
			return;
		}

		if (!newPassword) {
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Please provide a new password'
			});
			return;
		}

		//password validation
		try {
			if (!newPassword) {
				throw new Error('Password cannot be left blank');
			}
			if (newPassword.length < MIN_PASSWORD_LENGTH) {
				throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
			}
			if (newPassword.length > MAX_PASSWORD_LENGTH) {
				throw new Error(`Password must be at most ${MAX_PASSWORD_LENGTH} characters long`);
			}
			if (/\s/.test(newPassword)) {
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

		let hashedPassword: string = '';
        
		if (newPassword) {
			const salt = await bcrypt.genSalt(SALT_ROUNDS);
			hashedPassword = await bcrypt.hash(newPassword, salt);
		}
        
		const userExists = await prisma.user.findFirst({
			where: {
				username
			}
		});

		if (!userExists){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'No user exists by that username'
			});
			return;
		}

		const user = await prisma.user.update({
			where: { username },
			data: {
				password: hashedPassword
			}
		});

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});

		const token = generateToken(user.id);

		res.status(API_STATUS.OK).json({ user: populatedUser, token });
	});
}