import { Message } from '@prisma/client';
import { AxiosError } from 'axios';
import { Orbit, Check, PencilLine, RefreshCcw, X } from 'lucide-react';
import {
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { toast } from 'sonner';

import { Avatar } from '@/components/ui/avatar';
import MarkdownLatexWrapper from '@/components/ui/md-latex-wrapper';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';
import { getAvatar } from '@/lib/utils';
import chatService from '@/services/chatService';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface ChatBoxProps {
	user: PopulatedUser;
	chat: PopulatedChat;
	setChat: Dispatch<SetStateAction<PopulatedChat | undefined>>;
	awaitingResponse: boolean;
	setAwaitingResponse: Dispatch<SetStateAction<boolean>>;
	awaitingMessage?: { id: string, content: string };
}

export default function ChatBox({
	user,
	chat,
	setChat,
	awaitingResponse,
	setAwaitingResponse,
	awaitingMessage,
}: ChatBoxProps) {

	const [regenPrompt, setRegenPrompt] = useState<string>('');
	const [focusId, setFocusId] = useState<string>();

	const viewport = useRef<HTMLDivElement>(null);

	const sortedMessages = useMemo(() => {
		const res = chat.messages.sort((a, b) => Date.parse(a.createdAt as string) - Date.parse(b.createdAt as string));
		return res;
	}, [chat.messages]);

	const generatingMessages = useMemo(() => {
		if (awaitingMessage) {
			return [{
				id: awaitingMessage.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				fromClient: false,
				sender: process.env.NEXT_PUBLIC_CHATBOT_NAME as string,
				chatId: chat.id,
				content: awaitingMessage.content,
			}];
		} else {
			return [];
		}
	}, [awaitingMessage, chat.id]);

	const handlePromptChange = (e: string) => {
		if (e.length < MAX_MESSAGE_LENGTH) {
			setRegenPrompt(e);
		}
	};

	const handleRegenerate = async (id: string, prompt: string) => {
		if (!prompt || !id || awaitingResponse) return;

		setAwaitingResponse(true);

		//optmistic load
		const clone = [...chat.messages];

		const foundMessage = clone.find((m) => m.id === id);

		if (!foundMessage) return;

		const optimisticClientPayload: Message = {
			id: `temp-client-${user.id}-regen-message-${id}-${Date.now()}`,
			userId: user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			fromClient: true,
			sender: user.username,
			chatId: chat.id,
			content: prompt,
		};

		const optimisticMessages = clone.filter(
			(m) =>
				Date.parse(m.createdAt as string) <
				Date.parse(foundMessage.createdAt as string)
		);

		setChat((prev) => prev ? { ...prev, messages: [...optimisticMessages, optimisticClientPayload] } : prev);

		const res = await chatService.regeneratePrompt(chat.id, id, prompt);

		if (res instanceof AxiosError) {
			toast.error('Could not regenerate prompt', {
				description: 'An unexpected error occured while attempting to regenerate prompt'
			});
			setChat((prev) => (prev ? { ...prev, messages: clone } : prev));
		} else {
			setChat(res.chat);
		}

		setAwaitingResponse(false);
	};

	useEffect(() => {
		if (viewport.current) {
			viewport.current!.scrollTo({
				top: viewport.current!.scrollHeight,
				behavior: 'smooth',
			});
		}
	}, [chat, viewport, awaitingResponse, awaitingMessage]);

	return (
		<div className="w-full h-full rounded overflow-y-auto flex flex-col gap-2 p-1 pb-4" ref={viewport}>
			{[...sortedMessages, ...generatingMessages].map((message, key) => {
				if (message.fromClient) {
					return (
						<div
							className="grid grid-cols-[1fr_auto] gap-3 self-end w-3/4 max-w-[500px] items-end"
							key={`${message.id}-${key}`}
						>
							<div className="flex flex-col items-end gap-1 flex-grow">
								<p className="text-xs pr-1">
									{message.sender}
								</p>
								{message.id !== focusId ? (
									<>
										<div
											className="rounded py-2 px-4 text-sm h-fit shadow-md bg-white"
											style={{
												whiteSpace: 'wrap',
												wordBreak: 'break-word',
											}}
										>
											{message.content}
										</div>
									</>
								) : (
									<>
										<Textarea
											className='resize-none bg-white'
											onKeyDown={(e) => {
												if (e.key === 'Enter' && !e.shiftKey) {
													e.preventDefault();
													handleRegenerate(focusId, regenPrompt);
												}
											}}
											value={regenPrompt}
											onChange={(e) => {
												handlePromptChange(e.target.value);
											}}
										/>

										<div className="flex flex-row items-center justify-end gap-2 mt-1">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<button
															className='py-1 px-2 bg-zinc-100 shadow-md border border-primary/20 rounded'
															onClick={() => {
																setFocusId('');
																setRegenPrompt('');
															}}
														>
															<X size={12} />
														</button>
													</TooltipTrigger>
													<TooltipContent side="bottom">
														Cancel
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<button
															className='py-1 px-2 bg-zinc-100 shadow-md border border-primary/20 rounded'
															onClick={() => {
																handleRegenerate(focusId, regenPrompt);
															}}
														>
															<Check size={12} />
														</button>
													</TooltipTrigger>
													<TooltipContent side="bottom">
														Finish
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</>
								)}
								{message.id !== focusId && (
									<div className="flex flex-row items-center justify-end gap-2 mt-1">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														className='py-1 px-2 bg-zinc-100 shadow-md border border-primary/20 rounded'
														onClick={() => {
															handleRegenerate(message.id, message.content);
														}}
													>
														<RefreshCcw size={12} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom">
													Regenerate
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														className='py-1 px-2 bg-zinc-100 shadow-md border border-primary/20 rounded'
														onClick={() => {
															setFocusId(message.id);
															setRegenPrompt(message.content);
														}}
													>
														<PencilLine size={12} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom">
													Edit
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								)}
							</div>
							<Avatar className={'size-9 m-0.5 rounded-full mb-7'} style={getAvatar(user.username)} />
						</div>
					);
				} else {
					console.log(message.content.replace(/\\\(/g, '```latex\n').replace(/\\\)/g, '```'));

					return (
						<div
							className="grid grid-cols-[auto_1fr] gap-3 self-start w-6/7 max-w-[800px] items-end"
							key={`${message.id}`}
						>
							<div className='size-9 flex items-center justify-center bg-zinc-800 text-white rounded-full'>
								<Orbit size={18} />
							</div>
							<div className="flex flex-col items-start gap-1">
								<p className="text-xs pl-1">
									{message.sender}
								</p>
								<div className="rounded py-2 px-4 text-sm h-fit shadow-md bg-white">
									<MarkdownLatexWrapper>
										{message.content.replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$').replace(/\\\]/g, '$$')}
									</MarkdownLatexWrapper>
								</div>
							</div>
						</div>
					);
				}
			})}
			{awaitingResponse && !awaitingMessage && (
				<div className="grid grid-cols-[auto_1fr] gap-3 self-start w-3/4 max-w-[500px] items-end mt-3">
					<div className='size-9 flex items-center justify-center bg-zinc-800 text-white rounded-full'>
						<Orbit size={18} />
					</div>
					<div className="flex flex-col items-start">
						<p className="text-xs pl-1">{process.env.NEXT_PUBLIC_CHATBOT_NAME}</p>
						<div id="loading-wave" className="py-0.5 pl-1 h-fit">
							<span className="text-sm text-zinc-800 font-semibold pr-2">
								Generating
							</span>
							<div className="dot bg-zinc-800" />
							<div className="dot bg-zinc-800" />
							<div className="dot bg-zinc-800" />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}