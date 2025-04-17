import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError, PERMISSION } from '@/types/general';
import { EditUserResponse } from '@/types/server';


const prisma = new PrismaClient();

export default async function edit_user(
	req: NextApiRequest,
	res: NextApiResponse<EditUserResponse | APIError>,
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

		const { id, username, isAdmin } = req.body;

		if (!id) {
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Please provide an id'
			});
			return;
		}

		//username validation
		try {
			const regex = /^[a-zA-Z0-9.,_-]+$/;
			if (!username) {
				throw new Error('Username cannot be left blank');
			}
			if (username.length < 4) {
				throw new Error('Username must be at least 4 characters long');
			}
			if (username.length > 20) {
				throw new Error('Username must be at most 20 characters long');
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

		//duplicate checking
		const duplicate = await prisma.user.findFirst({
			where: { username }
		});

		if (duplicate && duplicate.id !== id) {
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Username already exists'
			});
			return;
		}

		await prisma.user.update({
			where: { id },
			data: {
				username,
				permissions: isAdmin ? PERMISSION.Admin : PERMISSION.User,
			}
		});

		await prisma.chat.updateMany({
			where: {
				creator: user.username
			},
			data: {
				creator: username
			}
		});

		const users = await prisma.user.findMany();
		res.status(API_STATUS.OK).json({ users, self: user.id === id});
	});
}