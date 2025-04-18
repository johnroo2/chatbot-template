import { Message } from '@prisma/client';
import { AxiosError } from 'axios';
import { Send } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import chatService from '@/services/chatService';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface ChatInputFieldProps {
	user: PopulatedUser;
	chat: PopulatedChat;
	setChat: Dispatch<SetStateAction<PopulatedChat | undefined>>;
	awaitingResponse: boolean;
	setAwaitingResponse: Dispatch<SetStateAction<boolean>>;
}

export default function ChatInputField({
	user,
	chat,
	setChat,
	awaitingResponse,
	setAwaitingResponse,
}: ChatInputFieldProps) {
	const [prompt, setPrompt] = useState<string>('');

	const handleSendMessage = async (prompt: string) => {
		if (!awaitingResponse && chat && prompt) {
			setPrompt('');
			setAwaitingResponse(true);

			//very important to optimistically load here, so we leave a fallback in case of error
			const clone = [...chat.messages];

			const optimisticClientPayload: Message = {
				id: `temp-client-${user.id}-message-${Date.now()}`,
				userId: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				fromClient: true,
				sender: user.username,
				chatId: chat.id,
				content: prompt,
			};

			setChat((prev) =>
				prev
					? {
						...prev,
						messages: [...chat.messages, optimisticClientPayload],
					}
					: prev
			);

			const res = await chatService.sendMessage(chat.id, prompt);
			if (res instanceof AxiosError) {
				toast.error('Could not send message', {
					description: res?.response?.data?.message || 'An unexpected error occured while attempting to send message'
				});

				setChat((prev) => (prev ? { ...prev, messages: clone } : prev));
			} else {
				setChat(res.chat);
			}
		}

		setAwaitingResponse(false);
	};

	const handlePromptChange = (e: string) => {
		if (e.length < 250) {
			setPrompt(e);
		}
	};

	return (
		<div
			className="grid gap-3 items-center"
			style={{
				gridTemplateColumns: '1fr auto',
			}}
		>
			<Textarea
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSendMessage(prompt);
					}
				}}
				className="resize-none relative h-10 !text-sm bg-white"
				placeholder="Send a prompt..."
				value={prompt}
				onChange={(e) => {
					handlePromptChange(e.currentTarget.value);
				}}
			/>
			<Button
				className='!size-10'
				disabled={awaitingResponse}
				onClick={() => {
					handleSendMessage(prompt);
				}}
			>
				<Send size={16} />
			</Button>
		</div>
	);
}