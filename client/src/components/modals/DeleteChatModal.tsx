import { AxiosError } from 'axios';
import { Trash } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import chatService from '@/services/chatService';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface DeleteChatModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>,
	focus?: PopulatedChat;
}

export default function DeleteChatModal({
	open,
	onClose,
	setUser,
	focus
}: DeleteChatModalProps) {

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
	}, [open]);

	const handleDeleteChat = async () => {
		if (!focus) {
			toast.error('Could not delete chat', {
				description: 'Chat ID does not exist'
			});
			return;
		}

		setLoading(true);

		const res = await chatService.deleteChat(focus.id);

		if (res instanceof AxiosError) {
			toast.error('Error while deleting chat', {
				description: res?.response?.data?.message || 'An unexpected error occured while handling chat deletion'
			});
		} else {
			toast.success('Chat deleted successfully', {
				description: `Chat ${res.chat.name} has been deleted`
			});
			setUser(res.user);
		}

		setLoading(false);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Trash size={16} />
						Delete Chat
					</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-left">
					Are you sure you want to delete the chat <b>{focus?.name}</b>?
					Warning: this action cannot be undone.
				</p>
				<DialogFooter className='flex justify-end items-center gap-3'>
					<Button
						variant='secondary'
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant='destructive'
						disabled={loading}
						onClick={handleDeleteChat}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}