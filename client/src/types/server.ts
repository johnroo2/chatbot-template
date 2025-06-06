import { User } from '@prisma/client';

import { PopulatedChat, PopulatedUser } from './populations';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GeneratePromptRequest {
    prompt: string;
    api_key: string;
    history: ChatMessage[];
    message_id: string;
    chat_id: string;
    user_id: string;
    username: string;
}

export type LoginResponse = {
    user: PopulatedUser,
    token: string
}

export type SignupResponse = LoginResponse
export type ChangePasswordResponse = LoginResponse

export type EditUserResponse = {
    users: User[],
    self: boolean
}

export type DeleteUserResponse = EditUserResponse

export type GetUserResponse = {
    user: PopulatedUser
}

export type CreateUserResponse = {
    user: PopulatedUser
}

export type GetAllUsersResponse = {
    users: User[]
}

export type CreateChatResponse = {
    user: PopulatedUser,
    chat: PopulatedChat
}

export type GetChatResponse = {
    user: PopulatedUser,
    chat: PopulatedChat
}

export type GetPublicChatsResponse = {
    chats: PopulatedChat[]
}

export type GetSharedChatResponse = {
    chat: PopulatedChat
}

export type EditChatResponse = {
    user: PopulatedUser,
    chat: PopulatedChat
}

export type DeleteChatResponse = {
    user: PopulatedUser,
    chat: PopulatedChat
}

export type SendMessageResponse = {
    chat: PopulatedChat
}

export type RegeneratePromptResponse = SendMessageResponse