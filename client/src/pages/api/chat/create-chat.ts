import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedChat, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError, VISIBILITY } from '@/types/general';
import { CreateChatResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function create_chat(
	req: NextApiRequest,
	res: NextApiResponse<CreateChatResponse | APIError>,
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

		const { chatName, chatPublic } = req.body;

		if (!chatName){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing chat name'
			});
			return;
		}

		if (![VISIBILITY.PUBLIC, VISIBILITY.PRIVATE].includes(chatPublic as VISIBILITY)){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Invalid chat visibility'
			});
			return;
		}

		const chat = await prisma.chat.create({
			data: {
				name: chatName,
				public: chatPublic === VISIBILITY.PUBLIC ? true : false,
				userId: user.id,
				creator: user.username
			}
		});

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});
		const populatedChat = await getPopulatedChat(prisma, {id: chat.id});

		res.status(API_STATUS.OK).json({
			user: populatedUser,
			chat: populatedChat
		});
	});
}