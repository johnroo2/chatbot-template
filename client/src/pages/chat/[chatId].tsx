import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import AppChatInterface from '@/components/chat/AppChatInterface';
import ChatLoader from '@/components/chat/ChatLoader';
import { BaseProps } from '@/pages/_app';
import chatService from '@/services/chatService';
import { BreadcrumbType } from '@/types/general';
import { PopulatedChat } from '@/types/populations';

export default function ChatInterface({ user, setUser }: BaseProps) {
	const params = useParams();
	const router = useRouter();

	const [chatId, setChatId] = useState<string>();
	const [chat, setChat] = useState<PopulatedChat>();
	const [progress, setProgress] = useState<number>(0);
	const intervalRef = useRef<NodeJS.Timeout>(undefined);

	useEffect(() => {
		if (params && params?.chatId) {
			setChatId(params?.chatId as string);
		}
	}, [params]);

	useEffect(() => {
		const fetch = async () => {
			if (chatId && user) {
				const res = await chatService.getChat(chatId);

				if (res instanceof AxiosError) {
					if (res.response && res.response.data.message === 'Chat not found') {
						router.push('/dashboard');
						toast.error('Fetching chat failed', {
							description: `Chat ${chatId} does not exist`
						});
					} else {
						toast.error('Fetching chat failed', {
							description: res?.response?.data?.message || 'An unexpected error occured while trying to fetch chat'
						});
					}
				} else {
					setChat(res.chat);
				}
			}

			setTimeout(() => {
				clearInterval(intervalRef.current);
				intervalRef.current = undefined;
				setProgress(0);
			}, 1500);
		};

		setProgress(1);
		intervalRef.current = setInterval(() => {
			setProgress(prev => prev + 1);
		}, 150);
		setChat(undefined);
		fetch();

		return () => {
			clearInterval(intervalRef.current);
			intervalRef.current = undefined;
		};
	}, [chatId, user, router.pathname, params, router]);

	return (
		<>
			<ChatLoader progress={progress} />
			<div className="relative w-full h-full grid pb-3 overflow-y-hidden">
				{chat && user && (
					<AppChatInterface
						user={user}
						setUser={setUser}
						chat={chat}
						setChat={setChat}
					/>
				)}
			</div>
		</>
	);
}

ChatInterface.breadcrumb = JSON.stringify([{ name: 'Chats', isLink: false }] as BreadcrumbType[]);