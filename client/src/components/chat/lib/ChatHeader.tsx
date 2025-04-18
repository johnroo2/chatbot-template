import { Edit, Ellipsis, Info, Orbit, Send, Trash } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

import DeleteChatModal from '@/components/modals/DeleteChatModal';
import EditChatModal from '@/components/modals/EditChatModal';
import ViewChatModal from '@/components/modals/ViewChatModal';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface ChatHeaderProps {
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
	chat: PopulatedChat;
}

export default function ChatHeader({ chat, setUser }: ChatHeaderProps) {
	const [headerModalOpen, setHeaderModalOpen] = useState<boolean>(false);
	const [editChatFocus, setEditChatFocus] = useState<PopulatedChat>();
	const [deleteChatFocus, setDeleteChatFocus] = useState<PopulatedChat>();
	//const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

	return (
		<>
			<Card className="py-2 px-4 bg-zinc-800 text-white !shadow-none">
				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row items-center gap-3">
						<Orbit size={20} />
						<h1>{chat.name}</h1>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Ellipsis />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-42">
							<DropdownMenuGroup>
								<DropdownMenuItem className='flex items-center gap-3' onClick={() => { setHeaderModalOpen(true); }}>
									<Info size={16} />
									Info
								</DropdownMenuItem>
								<DropdownMenuItem className='flex items-center gap-3' disabled={true}>
									{/* <DropdownMenuItem className='flex items-center gap-3' disabled={!c.public}> */}
									<Send size={16} />
									Share
								</DropdownMenuItem>
								<DropdownMenuItem className='flex items-center gap-3' onClick={() => { setEditChatFocus(chat); }}>
									<Edit size={16} />
									Modify properties
								</DropdownMenuItem>
								<DropdownMenuItem
									className='flex items-center gap-3 text-red-600 hover:!text-red-600 hover:!bg-red-50'
									onClick={() => { setDeleteChatFocus(chat); }}
								>
									<Trash size={16} />
									Delete chat
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</Card>
			<ViewChatModal
				open={headerModalOpen}
				onClose={() => {
					setHeaderModalOpen(false);
				}}
				focus={chat}
			/>
			<EditChatModal
				open={editChatFocus ? true : false}
				onClose={() => { setEditChatFocus(undefined); }}
				focus={editChatFocus}
				setUser={setUser}
			/>
			<DeleteChatModal
				open={deleteChatFocus ? true : false}
				onClose={() => { setDeleteChatFocus(undefined); }}
				focus={deleteChatFocus}
				setUser={setUser}
			/>
		</>
	);
}