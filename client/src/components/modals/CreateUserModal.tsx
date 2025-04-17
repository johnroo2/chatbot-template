import { User } from '@prisma/client';
import { AxiosError } from 'axios';
import { UserPlus } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH } from '@/lib/constants';
import userService from '@/services/userService';

interface CreateUserModalProps {
	open: boolean;
	onClose: () => void;
	setUsers: Dispatch<SetStateAction<User[]>>;
}

export default function CreateUserModal({ open, onClose, setUsers }: CreateUserModalProps) {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleCreateUser = async () => {
		if (!username || !password) {
			toast.error('Missing required fields', {
				description: 'Username and password are required'
			});
			return;
		}

		setLoading(true);

		const res = await userService.createUser(username, password.trim(), isAdmin);

		if (res instanceof AxiosError) {
			toast.error('Error while creating user', {
				description: res?.response?.data?.message || 'An unexpected error occurred while creating user'
			});
		} else {
			toast.success('User created successfully', {
				description: `User ${res.user.username} has been created`
			});

			const usersRes = await userService.getAllUsers();
			if (!(usersRes instanceof AxiosError)) {
				setUsers(usersRes.users);
			}

			setUsername('');
			setPassword('');
			setIsAdmin(false);
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
						<UserPlus size={16} />
						Create New User
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={(e) => {
					e.preventDefault();
					handleCreateUser();
				}}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								value={username}
								onChange={(e) => {
									const { value } = e.currentTarget;

									if (value.length > MAX_USERNAME_LENGTH) {
										setUsername(value.slice(0, MAX_USERNAME_LENGTH));
									} else {
										setUsername(value);
									}
								}}
								placeholder="Enter username"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<PasswordInput
								id="password"
								value={password}
								onChange={(e) => {
									const { value } = e.currentTarget;

									if (value.length > MAX_PASSWORD_LENGTH) {
										setPassword(value.slice(0, MAX_PASSWORD_LENGTH));
									} else {
										setPassword(value);
									}
								}}
								placeholder="Enter password"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="admin">Admin access</Label>
							<Switch
								id="admin"
								checked={isAdmin}
								onCheckedChange={setIsAdmin}
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
						onClick={handleCreateUser}
					>
						Create User
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
