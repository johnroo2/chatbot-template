import { Prisma, PrismaClient } from '@prisma/client';

import { PopulatedChat, PopulatedUser } from '@/types/populations';

export async function getPopulatedUser(prisma: PrismaClient, query: Prisma.UserWhereUniqueInput){
	const user = await prisma.user.findFirstOrThrow({
		where: query,
		include: {
			settings: true
		}
	});

	const baseChats = await prisma.chat.findMany({
		where: { userId: user.id}
	});

	const chats: PopulatedChat[] = [];

	for (const chat of baseChats) {
		const chatRes = await getPopulatedChat(prisma, {
			id: chat.id
		});

		if (chatRes){  
			chats.push(chatRes);
		}
	}

	const res: PopulatedUser = chats && chats.length > 0 ? {...user, chats} : {...user, chats: []};

	return res;
}

export async function getPopulatedChat(prisma: PrismaClient, query: Prisma.ChatWhereUniqueInput){
	const chat = await prisma.chat.findFirstOrThrow({
		where: query,
	});

	if (!chat) {
		return chat;
	}

	const messages = await prisma.message.findMany({
		where: { chatId: chat.id },
		orderBy: { createdAt: 'asc' }
	});

	const res: PopulatedChat = {...chat, messages};

	return res;
}

export async function deleteUser(prisma: PrismaClient, query: Prisma.UserWhereUniqueInput){
	const foundUser = await prisma.user.findFirstOrThrow({
		where: query,
		include: {
			settings: true
		}
	});

	await deleteAllChats(prisma, { userId: foundUser.id });

	await prisma.user.delete({
		where: query,
	});
	
	if (foundUser.settings) {
		await prisma.settings.delete({
			where: { id: foundUser.settingsId }
		});
	}
}

export async function deleteAllUsers(prisma: PrismaClient, query: Prisma.UserWhereInput){
	const foundUsers = await prisma.user.findMany({
		where: query,
		include: {
			settings: true
		}
	});

	for (const user of foundUsers){
		await deleteAllChats(prisma, { userId: user.id });
	}

	// Delete users first
	await prisma.user.deleteMany({
		where: query,
	});

	// Then delete their settings
	for (const user of foundUsers) {
		if (user.settings) {
			await prisma.settings.delete({
				where: { id: user.settingsId }
			});
		}
	}
}

export async function deleteChat(prisma: PrismaClient, query: Prisma.ChatWhereUniqueInput){
	const foundChat = await prisma.chat.findFirstOrThrow({
		where: query
	});

	await prisma.message.deleteMany({
		where: { chatId: foundChat.id }
	});

	await prisma.chat.delete({
		where: query
	});
}

export async function deleteAllChats(prisma: PrismaClient, query: Prisma.ChatWhereInput){
	const foundChats = await prisma.chat.findMany({
		where: query
	});

	for (const chat of foundChats){
		await prisma.message.deleteMany({
			where: { chatId: chat.id }
		});
	}

	await prisma.chat.deleteMany({
		where: query
	});
}
