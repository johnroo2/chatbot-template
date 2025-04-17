import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedChat, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError, VISIBILITY } from '@/types/general';
import { EditChatResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function edit_chat(
	req: NextApiRequest,
	res: NextApiResponse<EditChatResponse | APIError>,
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

		const { chatId, chatName, chatPublic } = req.body;

		if (!chatId){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing chat id'
			});
			return;
		}

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

		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId
			}
		}); 

		if (!chat){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Chat not found'
			});
			return;
		}
        
		if (chat.userId !== user.id){
			res.status(API_STATUS.FORBIDDEN).json({
				status: API_STATUS.FORBIDDEN,
				message: 'Access to chat denied'
			});
			return;
		}

		await prisma.chat.update({
			where: {
				id: chatId
			},
			data: {
				name: chatName,
				public: chatPublic === VISIBILITY.PUBLIC ? true : false
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