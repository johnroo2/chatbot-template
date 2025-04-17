import { User } from '@prisma/client';
import { AxiosError } from 'axios';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import cookies from '@/lib/cookies';
import userService from '@/services/userService';
import { LS_KEYS } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

interface DeleteUserModalProps {
	open: boolean;
	onClose: () => void;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>,
	setUsers: Dispatch<SetStateAction<User[]>>
	focus?: User;
	user?: PopulatedUser;
}

export default function DeleteUserModal({
	open,
	onClose,
	setUser,
	setUsers,
	focus,
	user
}: DeleteUserModalProps) {

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);
	const isSelf = focus?.id === user?.id;

	useEffect(() => {
		setLoading(false);
	}, [open]);

	const handleDeleteUser = async () => {
		if (!focus) {
			toast.error('Could not delete user', {
				description: 'User ID does not exist'
			});
			return;
		}

		setLoading(true);

		const res = await userService.deleteUserById(focus.id);

		if (res instanceof AxiosError) {
			toast.error('Error while deleting user', {
				description: res?.response?.data?.message || 'An unexpected error occurred while handling user deletion'
			});
		} else {
			toast.success('User deleted successfully', {
				description: `User ${focus.username} has been deleted`
			});

			if (isSelf) {
				cookies.remove(LS_KEYS.token);
				setUser(undefined);
				router.push('/login');
				toast.success('Logged out', {
					description: 'You have been signed out'
				});
			} else {
				setUsers(res.users);
			}
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
						Delete User
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-2 text-left">
					<p className="text-sm">
						Are you sure you want to delete the user <b>{focus?.username}</b>?
						Warning: this action cannot be undone.
					</p>
					{isSelf && (
						<p className="text-sm text-destructive font-medium">
							You are about to delete your own account. You will be logged out immediately.
						</p>
					)}
				</div>
				<DialogFooter className='flex justify-end items-center gap-3'>
					<Button
						variant='secondary'
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						disabled={loading}
						onClick={handleDeleteUser}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
