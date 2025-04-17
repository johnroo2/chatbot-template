import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedChat } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import { API_STATUS, APIError } from '@/types/general';
import { GetSharedChatResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function get_shared_chat(
	req: NextApiRequest,
	res: NextApiResponse<GetSharedChatResponse | APIError>,
) {
	serverErrorHandler('GET', req, res, async() => {
		const chatId = req.query.id as string;

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

		if (!chat.public){
			res.status(API_STATUS.FORBIDDEN).json({
				status: API_STATUS.FORBIDDEN,
				message: 'This chat is not publicly shared'
			});
			return;
		}

		const populatedChat = await getPopulatedChat(prisma, {id: chat.id});

		res.status(API_STATUS.OK).json({
			chat: populatedChat
		});
	});
}