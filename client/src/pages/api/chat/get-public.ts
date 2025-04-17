import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedChat, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { GetPublicChatsResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_public_chats(
	req: NextApiRequest,
	res: NextApiResponse<GetPublicChatsResponse | APIError>,
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

		const publicChats = await prisma.chat.findMany({
			where: {
				public: true
			},
			orderBy: {
				updatedAt: 'desc'
			}
		});

		if (!publicChats || publicChats.length === 0) {
			res.status(API_STATUS.OK).json({
				chats: []
			});
			return;
		}

		const populatedChats = await Promise.all(
			publicChats.map(chat => getPopulatedChat(prisma, { id: chat.id }))
		);

		const filteredChats = populatedChats.filter(Boolean);

		res.status(API_STATUS.OK).json({
			chats: filteredChats
		});
	});
}