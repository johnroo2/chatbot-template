import { AxiosError } from 'axios';
import { Plus } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import chatService from '@/services/chatService';
import { VISIBILITY } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

interface CreateChatModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
}

export default function CreateChatModal({
	open,
	onClose,
	setUser
}: CreateChatModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [name, setName] = useState<string>('');
	const [isPublic, setIsPublic] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
		setName('');
		setIsPublic(false);
	}, [open]);

	const handleCreateChat = async () => {
		if (!name.trim()) {
			toast.error('Could not create chat', {
				description: 'Chat name cannot be empty'
			});
			return;
		}

		setLoading(true);

		const res = await chatService.createChat(name, isPublic ? VISIBILITY.PUBLIC : VISIBILITY.PRIVATE);

		if (res instanceof AxiosError) {
			toast.error('Error while creating chat', {
				description: res?.response?.data?.message || 'An unexpected error occurred while creating chat'
			});
		} else {
			toast.success('Chat created successfully', {
				description: `Chat ${res.chat.name} has been created`
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
						<Plus size={16} />
						Create New Chat
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={(e) => {
					e.preventDefault();
					handleCreateChat();
				}}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Chat Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter chat name"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="public">Make chat public</Label>
							<Switch
								id="public"
								checked={isPublic}
								onCheckedChange={setIsPublic}
							/>
						</div>
					</div>
				</form>
				<DialogFooter className='flex justify-end items-center gap-3'>
					<Button
						variant='secondary'
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						disabled={loading}
						onClick={handleCreateChat}
					>
						Create Chat
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}