import { useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';

import PublicChatTable from '@/components/browse/PublicChatTable';
import { Card } from '@/components/ui/card';
import chatService from '@/services/chatService';
import { BreadcrumbType } from '@/types/general';
import { PopulatedChat } from '@/types/populations';

export default function Browse() {
	const [publicChats, setPublicChats] = useState<PopulatedChat[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchPublicChats = async () => {
			setLoading(true);
			const response = await chatService.getPublicChats();
			if ('chats' in response) {
				setPublicChats(response.chats);
			}

			setTimeout(() => {
				setLoading(false);
			}, 3000);
		};

		fetchPublicChats();
	}, []);

	return (
		<div className='w-full h-full pb-4 relative'>
			<div
				className={`flex flex-col items-center justify-center transition-opacity duration-500 
				absolute inset-0 gap-5 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white z-[500]`}
			>
				<ScaleLoader />
				<div className="flex items-end gap-1.5">
					<p className="text-foreground">Loading public chats</p>
					<div id="loading-wave">
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
						<span className="dot bg-foreground"></span>
					</div>
				</div>
			</div>
			<Card className='w-full h-full p-4 bg-white grid grid-rows-[auto_1fr] overflow-y-auto gap-4'>
				<div>
					<h1 className='font-medium text-base'>Public Chats</h1>
					<p className='text-muted-foreground text-sm'>
						Browse all publicly available chats
					</p>
				</div>
				<PublicChatTable chats={publicChats} />
			</Card>
		</div>
	);
}

Browse.breadcrumb = JSON.stringify([{ name: 'Browse', isLink: true, link: '/browse' }] as BreadcrumbType[]);
