import { User } from '@prisma/client';
import { AxiosError } from 'axios';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MAX_USERNAME_LENGTH } from '@/lib/constants';
import userService from '@/services/userService';
import { PERMISSION } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

interface EditUserModalProps {
	user: PopulatedUser;
	focus: User | undefined;
	open: boolean;
	onClose: () => void;
	setUsers: Dispatch<SetStateAction<User[]>>;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
}

export default function EditUserModal({ user, focus, open, onClose, setUsers, setUser }: EditUserModalProps) {
	const router = useRouter();
	const [username, setUsername] = useState<string>('');
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [selfAdminWarning, setSelfAdminWarning] = useState<boolean>(false);

	useEffect(() => {
		if (focus) {
			setUsername(focus.username);
			setIsAdmin(focus.permissions === PERMISSION.Admin);
		}
	}, [focus]);

	useEffect(() => {
		if (focus && user.id === focus.id && user.permissions === PERMISSION.Admin && !isAdmin) {
			setSelfAdminWarning(true);
		} else {
			setSelfAdminWarning(false);
		}
	}, [focus, isAdmin, user.id, user.permissions]);

	const handleSubmit = async () => {
		if (!focus) return;

		if (!username) {
			toast.error('Missing required fields', {
				description: 'Username is required'
			});
			return;
		}

		setLoading(true);

		try {
			const res = await userService.editUser(focus.id, username, isAdmin);

			if (res instanceof AxiosError) {
				toast.error('Failed to update user', {
					description: res?.response?.data?.message || 'An unexpected error occurred'
				});
			} else {
				setUsers(res.users);

				if (res.self) {
					const updatedSelf = res.users.find(u => u.id === user.id);
					if (updatedSelf) {
						setUser(prev => prev ? ({ ...prev, ...updatedSelf }) : prev);
					}
				}

				if (res.self && user.permissions === PERMISSION.Admin && !isAdmin) {
					router.push('/dashboard');
					toast.warning('Admin privileges removed', {
						description: 'You have removed your own admin privileges'
					});
				} else {
					toast.success('User updated successfully', {
						description: `User ${username} has been updated`
					});
				}
				handleClose();
			}
		} catch {
			toast.error('Failed to update user', {
				description: 'An unexpected error occurred'
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setUsername('');
		setIsAdmin(false);
		setSelfAdminWarning(false);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
				</DialogHeader>

				<form onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
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
								className="col-span-3"
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="admin">Admin privileges</Label>
							<Switch
								id="admin"
								checked={isAdmin}
								onCheckedChange={setIsAdmin}
							/>
						</div>
					</div>

					{selfAdminWarning && (
						<div className="col-span-4 text-red-500 flex items-start gap-2 mt-5 text-sm">
							<AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
							<span>
								Warning: You are removing your own admin privileges. You will lose access to admin features after saving.
							</span>
						</div>
					)}
				</form>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={loading || !username}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
