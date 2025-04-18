import { PrismaClient } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { getPopulatedChat, getPopulatedUser } from '@/lib/prisma-utils';
import serverErrorHandler from '@/lib/serverErrorHandler';
import verifyToken from '@/lib/verifyToken';
import { API_STATUS, APIError } from '@/types/general';
import { ChatMessage, GeneratePromptRequest, SendMessageResponse } from '@/types/server';

const prisma = new PrismaClient();

export default async function send_message(
	req: NextApiRequest,
	res: NextApiResponse<APIError | SendMessageResponse>,) {

	serverErrorHandler('POST', req, res, async() => {
		const { chatId, prompt } = req.body;

		if (!chatId){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing chat ID'
			});
		}

		if (!prompt){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Missing prompt'
			});
		}

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

		const chat = await getPopulatedChat(prisma, {id: chatId as string});

		if (!chat){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Chat not found'
			});
			return;
		}

		if (chat.userId !== user.id){
			res.status(API_STATUS.NOT_FOUND).json({
				status: API_STATUS.NOT_FOUND,
				message: 'Chat ID does not belong to user'
			});
			return;
		}

		const chatHistory: ChatMessage[] = chat.messages
			.sort((a, b) => Date.parse(a.createdAt as string) - Date.parse(b.createdAt as string))
			.slice(0, 10)
			.map(message => ({
				role: message.fromClient ? 'user' : 'assistant',
				content: message.content
			}));

		const clientMessage = await prisma.message.create({
			data: {
				chatId: chat.id,
				userId: user.id,
				sender: user.username,
				content: prompt,
				fromClient: true
			}
		});

		const starterMessage = await prisma.message.create({
			data: {
				chatId: chat.id,
				userId: user.id,
				sender: process.env.NEXT_PUBLIC_CHATBOT_NAME as string,
				content: '',
				fromClient: false
			}
		});

		const payload: GeneratePromptRequest = {
			api_key: process.env.API_KEY as string,
			chat_id: chat.id,
			history: chatHistory,
			message_id: starterMessage.id,
			prompt: prompt,
			user_id: user.id,
			username: user.username
		};

		const generatedResponse = await axios.post(process.env.PROMPT_GENERATION_URL as string, payload).then(
			res => res.data.message
		).catch(async(e) => {
			const modelMessage = await prisma.message.update({
				where: {id: starterMessage.id},
				data: {
					chatId: chat.id,
					sender: process.env.NEXT_PUBLIC_CHATBOT_NAME as string,
					content: e instanceof AxiosError ?
						`Sorry, something went wrong. Please try again. Error: ${e.message}` :
						'Sorry, something went wrong. Please try again.',
					fromClient: false
				}
			});

			chat.messages = [...chat.messages, clientMessage, modelMessage];

			throw e;
		});

		const modelMessage = await prisma.message.update({
			where: {id: starterMessage.id},
			data: {
				chatId: chat.id,
				sender: process.env.NEXT_PUBLIC_CHATBOT_NAME as string,
				content: generatedResponse,
				fromClient: false
			}
		});

		chat.messages = [...chat.messages, clientMessage, modelMessage];

		res.status(API_STATUS.OK).json({ chat });

	});
}