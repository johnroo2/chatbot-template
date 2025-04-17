import { Chat, Message, User } from '@prisma/client';

export interface Prisma_DS {
    createdAt: Date | string,
    updatedAt: Date | string
}

export type PopulatedMessage = Message & Prisma_DS

export type PopulatedChat = Chat & {
    messages: PopulatedMessage[];
} & Prisma_DS

export type PopulatedUser = User & {
    chats: PopulatedChat[];
} & Prisma_DS