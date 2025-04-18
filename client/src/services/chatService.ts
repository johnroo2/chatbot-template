import { AxiosError } from 'axios';

import { Service } from '@/lib/serviceRoot';
import { APIError, VISIBILITY } from '@/types/general';
import { CreateChatResponse, DeleteChatResponse, EditChatResponse, GetChatResponse, GetPublicChatsResponse, GetSharedChatResponse, RegeneratePromptResponse, SendMessageResponse } from '@/types/server';

class ChatService extends Service {
	constructor(url: string) {
		super(url);
	}

	/**
	 * Creates a new chat
	 * @param {string} chatName Name for the chat
	 * @param {VISIBILITY} chatPublic Visibility for the chat
	 * @returns {Promise<CreateChatResponse | AxiosError<APIError>>} The updated user and new chat
	 */
	async createChat(chatName: string, chatPublic: VISIBILITY): Promise<CreateChatResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<CreateChatResponse>(() =>
			this.instance.post('/api/chat/create-chat', {
				chatName,
				chatPublic
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Deletes a chat by id
	 * @param {string} chatId The chat's id
	 * @returns {Promise<DeleteChatResponse | AxiosError<APIError>>} The updated user
	 */
	async deleteChat(chatId: string): Promise<DeleteChatResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<DeleteChatResponse>(() =>
			this.instance.post('/api/chat/delete-chat', {
				chatId
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Edits a chat's metadata
	 * @param {string} chatId The chat's id
	 * @param {string} chatName New name for the chat
	 * @param {VISIBILITY} chatPublic New visibility for the chat
	 * @returns {Promise<EditChatResponse | AxiosError<APIError>>} The updated user and chat
	 */
	async editChat(chatId: string, chatName: string, chatPublic: VISIBILITY): Promise<EditChatResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<EditChatResponse>(() =>
			this.instance.post('/api/chat/edit-chat', {
				chatId,
				chatName,
				chatPublic
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Gets a chat by id
	 * @param {string} chatId The chat's id
	 * @returns {Promise<GetChatResponse | AxiosError<APIError>>} The user and chat if found
	 */
	async getChat(chatId: string): Promise<GetChatResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<GetChatResponse>(() =>
			this.instance.get(`/api/chat/get-chat?id=${chatId}`, this.applyHeaders())
		)();
	}

	/**
	 * Gets a shared chat by id
	 * @param {string} chatId The chat's id
	 * @returns {Promise<GetSharedChatResponse | AxiosError<APIError>>} The chat if found
	 */
	async getSharedChat(chatId: string): Promise<GetSharedChatResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<GetSharedChatResponse>(() =>
			this.instance.get(`/api/chat/get-shared-chat?id=${chatId}`, this.applyHeaders())
		)();
	}

	/**
	 * Gets all public chats
	 * @returns {Promise<GetPublicChatsResponse | AxiosError<APIError>>} List of public chats
	 */
	async getPublicChats(): Promise<GetPublicChatsResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<GetPublicChatsResponse>(() =>
			this.instance.get('/api/chat/get-public', this.applyHeaders())
		)();
	}

	/**
	 * Sends a message to the chat
	 * @param {string} chatId The chat's id
	 * @param {string} prompt The message to send
	 * @returns {Promise<SendMessageResponse | AxiosError<APIError>>} The updated chat
	 */
	async sendMessage(chatId: string, prompt: string): Promise<SendMessageResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<SendMessageResponse>(() =>
			this.instance.post('/api/chat/send-message', {
				chatId,
				prompt
			}, this.applyHeaders())
		)();
	}

	/**
	 * Regenerates the prompt for the chat
	 * @param {string} chatId The chat's id
	 * @returns {Promise<RegeneratePromptResponse | AxiosError<APIError>>} The updated chat
	 */
	async regeneratePrompt(chatId: string, messageId: string, prompt: string): Promise<RegeneratePromptResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<RegeneratePromptResponse>(() =>
			this.instance.post('/api/chat/regenerate-prompt', {
				chatId,
				messageId,
				prompt
			}, this.applyHeaders())
		)();
	}
}

const chatService = new ChatService(process.env.NEXT_PUBLIC_CLIENT_URL as string);

export default chatService;
