import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError, PERMISSION } from '@/types/general';
import { GetAllUsersResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_users(
	req: NextApiRequest,
	res: NextApiResponse<GetAllUsersResponse | APIError>,
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

		const users = await prisma.user.findMany();

		res.status(API_STATUS.OK).json({ users });
	});
}