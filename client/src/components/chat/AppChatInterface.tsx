import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { ChatBox, ChatHeader, ChatInputField } from '@/components/chat/lib/_index';
import { Card } from '@/components/ui/card';
import { initSockets } from '@/lib/initSockets';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface AppChatInterfaceProps {
	user: PopulatedUser;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
	chat: PopulatedChat;
	setChat: Dispatch<SetStateAction<PopulatedChat | undefined>>;
}

export default function AppChatInterface({ user, setUser, chat, setChat }: AppChatInterfaceProps) {
	const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
	const [awaitingMessage, setAwaitingMessage] = useState<{ id: string, content: string }>();

	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (!socket) {
			setSocket(io(process.env.NEXT_PUBLIC_SERVER_URL));
			return;
		};

		return () => {
			socket?.disconnect();
		};
	}, [socket]);

	useEffect(() => {
		if (!socket) return;

		initSockets(socket, {
			updateMessage(data) {
				const { id, content } = data;

				setAwaitingMessage(prev => prev ? { ...prev, content: prev.content + content } : { id, content });
			},
			//this doesn't actually get used, the way react works makes it weird
			finishMessage() {
				setAwaitingMessage(undefined);
			},
		});
	}, [socket, setChat]);

	return (
		<>
			<Card className='w-full h-full bg-zinc-50 grid grid-rows-[auto_1fr_auto] gap-3 p-3 overflow-y-auto'>
				<ChatHeader
					setUser={setUser}
					chat={chat}
				/>
				<ChatBox
					user={user}
					awaitingResponse={awaitingResponse}
					setAwaitingResponse={setAwaitingResponse}
					awaitingMessage={awaitingMessage}
					chat={chat}
					setChat={setChat}
				/>
				<ChatInputField
					user={user}
					awaitingResponse={awaitingResponse}
					setAwaitingResponse={setAwaitingResponse}
					chat={chat}
					setChat={setChat}
				/>
			</Card>
		</>
	);
}