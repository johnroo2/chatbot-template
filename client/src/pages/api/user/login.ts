import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { generateToken } from '@/lib/generateToken';
import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import { API_STATUS, APIError } from '@/types/general';
import { LoginResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function login(
	req: NextApiRequest,
	res: NextApiResponse<APIError | LoginResponse>
) {
	serverErrorHandler('POST', req, res, async() => {
		const { username, password } = req.body;

		if (!username){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Username cannot be left blank'
			});
			return;
		}

		if (!password){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Password cannot be left blank'
			});
			return;
		}

		const checkUser = await prisma.user.findUnique({
			where: {username: username}
		});

		if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
			res.status(API_STATUS.UNAUTHORIZED).json({
				status: API_STATUS.UNAUTHORIZED,
				message: 'Username or password is incorrect'
			});
			return;
		}

		const user = await getPopulatedUser(prisma, {username: username});

		if (!user){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'User not found'
			});
			return;
		}

		const token = generateToken(user.id);

		res.status(API_STATUS.OK).json({ user, token });

	});
}