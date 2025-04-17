import { ArrowRight, ChevronDown, Edit, Ellipsis, Globe, Lock, Send, Trash, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { toast } from 'sonner';

import ChatTableEmpty from './ChatTableEmpty';

import DeleteChatModal from '@/components/modals/DeleteChatModal';
import EditChatModal from '@/components/modals/EditChatModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface ChatTableProps {
	chats: PopulatedChat[];
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>
}

export default function ChatTable({ chats, setUser }: ChatTableProps) {
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

	const [deleteFocus, setDeleteFocus] = useState<PopulatedChat>();
	const [editFocus, setEditFocus] = useState<PopulatedChat>();

	const filteredChats = useMemo(() => {
		return chats.filter((chat) =>
			chat.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(visibilityFilter === 'all' || (visibilityFilter === 'public' && chat.public) || (visibilityFilter === 'private' && !chat.public))
		).sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
	}, [chats, searchTerm, sortOrder, visibilityFilter]);

	const handleNavigate = (chat: PopulatedChat) => {
		router.push(`/chat/${chat.id}`);
	};

	const handleDelete = (chat: PopulatedChat) => {
		setDeleteFocus(chat);
	};

	const handleModify = (chat: PopulatedChat) => {
		setEditFocus(chat);
	};

	const handleShare = (chat: PopulatedChat) => {
		const shareUrl = `${window.location.origin}/shared-chat/${chat.id}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success('Link copied to clipboard!');
	};

	const resetFilters = () => {
		setSortOrder('asc');
		setVisibilityFilter('all');
		setSearchTerm('');
	};

	return (
		<>
			<div className='grid grid-rows-[auto_auto_1fr]'>
				<div className="flex gap-4 mb-4">
					<Input
						type="text"
						className='max-w-[250px]'
						placeholder="Search..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-2/5">Chat Name</TableHead>
							<TableHead className="w-1/5 text-center">
								<button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center w-full">
									Upload Date
									<ChevronDown
										className={`ml-1 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
										size={16}
									/>
								</button>
							</TableHead>
							<TableHead className="w-1/5">
								<div className="flex flex-row items-center justify-center w-full gap-3">
									<span>Visibility</span>
									<div className="flex">
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('all')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'all' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Users size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: All</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('public')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'public' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Globe size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: Public</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger>
													<button
														onClick={() => setVisibilityFilter('private')}
														className={`p-1 rounded transition-colors duration-300 ${visibilityFilter === 'private' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Lock size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: Private</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</TableHead>
							<TableHead className="w-1/5 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredChats && filteredChats.length > 0 && (
							filteredChats.map((chat) => (
								<TableRow key={chat.id}>
									<TableCell className="w-2/5"><a href={`/chat/${chat.id}`}>{chat.name}</a></TableCell>
									<TableCell className="w-1/5 text-center">{new Date(chat.createdAt).toLocaleString('en-US')}</TableCell>
									<TableCell className="w-1/5 text-center">{chat.public ? 'Public' : 'Private'}</TableCell>
									<TableCell className="w-1/5 text-center">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Ellipsis size={20} />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													className='flex items-center gap-2'
													onClick={() => handleNavigate(chat)}
												>
													<ArrowRight size={16} />
													View
												</DropdownMenuItem>
												<DropdownMenuItem
													className='flex items-center gap-2'
													onClick={() => handleShare(chat)}
													disabled={!chat.public}
												>
													<Send size={16} />
													Share
												</DropdownMenuItem>
												<DropdownMenuItem
													disabled={deleteFocus ? true : false}
													className='flex items-center gap-2'
													onClick={() => handleModify(chat)}
												>
													<Edit size={16} />
													Modify
												</DropdownMenuItem>
												<DropdownMenuItem
													disabled={editFocus ? true : false}
													className='flex items-center gap-2 !text-red-600 hover:!bg-red-50'
													onClick={() => handleDelete(chat)}
												>
													<Trash size={16} className='text-red-600' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				{!filteredChats || filteredChats.length === 0 && <ChatTableEmpty reset={resetFilters} />}
			</div>
			<DeleteChatModal
				open={deleteFocus ? true : false}
				onClose={() => { setDeleteFocus(undefined); }}
				setUser={setUser}
				focus={deleteFocus}
			/>
			<EditChatModal
				open={editFocus ? true : false}
				onClose={() => { setEditFocus(undefined); }}
				setUser={setUser}
				focus={editFocus}
			/>
		</>
	);
}