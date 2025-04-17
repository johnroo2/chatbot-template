import { AxiosError } from 'axios';
import { Edit } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import chatService from '@/services/chatService';
import { VISIBILITY } from '@/types/general';
import { PopulatedChat, PopulatedUser } from '@/types/populations';

interface EditChatModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>,
	focus?: PopulatedChat;
}

export default function EditChatModal({
	open,
	onClose,
	setUser,
	focus
}: EditChatModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [name, setName] = useState<string>('');
	const [isPublic, setIsPublic] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
		if (focus) {
			setName(focus.name);
			setIsPublic(focus.public);
		}
	}, [open, focus]);

	const handleEditChat = async () => {
		if (!focus) {
			toast.error('Could not edit chat', {
				description: 'Chat ID does not exist'
			});
			return;
		}

		if (!name.trim()) {
			toast.error('Could not edit chat', {
				description: 'Chat name cannot be empty'
			});
			return;
		}

		setLoading(true);

		const res = await chatService.editChat(focus.id, name, isPublic ? VISIBILITY.PUBLIC : VISIBILITY.PRIVATE);

		if (res instanceof AxiosError) {
			toast.error('Error while editing chat', {
				description: res?.response?.data?.message || 'An unexpected error occurred while handling chat edit'
			});
		} else {
			toast.success('Chat edited successfully', {
				description: `Chat ${res.chat.name} has been updated`
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
						<Edit size={16} />
						Edit Chat
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={(e) => {
					e.preventDefault();
					handleEditChat();
				}}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Chat Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Chat Name"
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
						onClick={handleEditChat}
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
