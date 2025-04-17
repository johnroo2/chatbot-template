import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { deleteChat, getPopulatedChat, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { DeleteChatResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function delete_chat(
	req: NextApiRequest,
	res: NextApiResponse<DeleteChatResponse | APIError>,
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

		const { chatId } = req.body;

		if (!chatId){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing chat id'
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

		if (!chat.public && chat.userId !== user.id){
			res.status(API_STATUS.FORBIDDEN).json({
				status: API_STATUS.FORBIDDEN,
				message: 'Access to chat denied'
			});
			return;
		}

		const populatedChat = await getPopulatedChat(prisma, {id: chat.id});

		await deleteChat(prisma, {id: chat.id});

		const populatedUser = await getPopulatedUser(prisma, {id: user.id});

		res.status(API_STATUS.OK).json({
			user: populatedUser,
			chat: populatedChat
		});
	});
}