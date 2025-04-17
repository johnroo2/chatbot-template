import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { GetUserResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_user(
	req: NextApiRequest,
	res: NextApiResponse<GetUserResponse | APIError>,
) {
	serverErrorHandler('GET', req, res, async() => {
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
				message: 'User not found'
			});
			return;
		}

		if (user){
			res.status(API_STATUS.OK).json({ user });
		}
		else {
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'No user found with this token'
			});
		}
	});
}