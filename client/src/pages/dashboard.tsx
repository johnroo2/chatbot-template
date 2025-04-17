import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';

import ChatTable from '@/components/dashboard/ChatTable';
import CreateChatModal from '@/components/modals/CreateChatModal';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAvatar } from '@/lib/utils';
import { BaseProps } from '@/pages/_app';
import { BreadcrumbType } from '@/types/general';

export default function Dashboard({ user, setUser, userLoading }: BaseProps) {
	const [createChatModalOpen, setCreateChatModalOpen] = useState<boolean>(false);
	const [showLoading, setShowLoading] = useState<boolean>(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<div className='w-full h-full pb-4 relative'>
				<div
					className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${(userLoading || showLoading) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white z-[500]`}
				>
					<ScaleLoader />
					<div className="flex items-end gap-1.5">
						<p className="text-foreground">Loading dashboard</p>
						<div id="loading-wave">
							<span className="dot bg-foreground"></span>
							<span className="dot bg-foreground"></span>
							<span className="dot bg-foreground"></span>
						</div>
					</div>
				</div>
				<Card className='w-full h-full p-4 bg-white grid grid-rows-[auto_1fr] overflow-y-auto gap-4'>
					<div className='flex justify-between items-center gap-4'>
						{user &&
							<div className='flex items-center gap-3'>
								<Avatar className={'size-8 m-0.5 rounded-full'} style={getAvatar(user.username)} />
								<div>
									<h1 className='font-medium text-base'>Welcome, {user.username}!</h1>
									<p className='text-muted-foreground text-sm'>
										{(user?.chats || []).length > 0 ? 'Start a new chat or view an existing one!' : 'Start your first chat here!'}
									</p>
								</div>
							</div>
						}
						<Button
							className='flex items-center gap-2'
							variant='ghost'
							disabled={createChatModalOpen}
							onClick={() => { setCreateChatModalOpen(true); }}
						>
							<Plus />
							Create Chat
						</Button>
					</div>
					{user &&
						<ChatTable
							chats={user.chats}
							setUser={setUser}
						/>
					}
				</Card>
			</div>
			<CreateChatModal
				open={createChatModalOpen}
				onClose={() => { setCreateChatModalOpen(false); }}
				setUser={setUser}
			/>
		</>
	);
}

Dashboard.breadcrumb = JSON.stringify([{ name: 'Dashboard', isLink: true, link: '/dashboard' }] as BreadcrumbType[]);