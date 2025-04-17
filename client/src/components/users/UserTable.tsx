import { User } from '@prisma/client';
import { ChevronDown, Edit, Ellipsis, RefreshCcw, Trash, User as UserIcon, Users } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import DeleteUserModal from '@/components/modals/DeleteUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PERMISSION } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

interface UserTableProps {
	user: PopulatedUser;
	users: User[];
	setUsers: Dispatch<SetStateAction<User[]>>;
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>;
}

export default function UserTable({ user, users, setUser, setUsers }: UserTableProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

	const [deleteFocus, setDeleteFocus] = useState<User>();
	const [editFocus, setEditFocus] = useState<User>();

	const filteredUsers = useMemo(() => {
		return users.filter((user) =>
			(user.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
			(roleFilter === 'all' ||
				(roleFilter === 'admin' && user.permissions === 'admin') ||
				(roleFilter === 'user' && user.permissions === 'user'))
		).sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
	}, [users, searchTerm, sortOrder, roleFilter]);

	const handleDelete = (user: User) => {
		setDeleteFocus(user);
	};

	const handleModify = (user: User) => {
		setEditFocus(user);
	};

	const resetFilters = () => {
		setSortOrder('asc');
		setRoleFilter('all');
		setSearchTerm('');
	};

	return (
		<>
			<div className='grid grid-rows-[auto_auto_1fr]'>
				<div className="flex gap-4 mb-4 items-center">
					<Input
						type="text"
						className='max-w-[250px]'
						placeholder="Search users..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Button
						variant="outline"
						className='flex items-center gap-2'
						onClick={resetFilters}
					>
						<RefreshCcw size={16} />
						Reset Filters
					</Button>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-1/4">Username</TableHead>
							<TableHead className="w-1/4 text-center">
								<div className="flex flex-row items-center justify-center w-full gap-3">
									<span>Access Level</span>
									<div className="flex">
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger asChild>
													<button
														onClick={() => setRoleFilter('all')}
														className={`p-1 rounded transition-colors duration-300 ${roleFilter === 'all' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<Users size={16} />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: All</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger asChild>
													<button
														onClick={() => setRoleFilter('admin')}
														className={`p-1 rounded transition-colors duration-300 ${roleFilter === 'admin' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<UserIcon size={16} className="text-purple-700" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: Admin</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip delayDuration={0}>
												<TooltipTrigger asChild>
													<button
														onClick={() => setRoleFilter('user')}
														className={`p-1 rounded transition-colors duration-300 ${roleFilter === 'user' ? 'bg-muted-foreground/20' : 'bg-transparent'}`}
													>
														<UserIcon size={16} className="text-sky-700" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom" sideOffset={0}>Show: User</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</TableHead>
							<TableHead className="w-1/4 text-center">
								<button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center w-full">
									Joined
									<ChevronDown
										className={`ml-1 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
										size={16}
									/>
								</button>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredUsers && filteredUsers.length > 0 && (
							filteredUsers.map((user) => (
								<TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
									<TableCell className="w-1/4">{user.username}</TableCell>
									<TableCell className="w-1/4 text-center">
										{user.permissions === PERMISSION.User ? (
											<Badge className='bg-sky-700 hover:bg-sky-700 flex items-center gap-1 mx-auto w-fit'><UserIcon size={12} /> User</Badge>
										) : (
											<Badge className='bg-purple-700 hover:bg-purple-700 flex items-center gap-1 mx-auto w-fit'><UserIcon size={12} /> Admin</Badge>
										)}
									</TableCell>
									<TableCell className="w-1/4 text-center">{new Date(user.createdAt).toLocaleDateString('en-US')}</TableCell>
									<TableCell className="w-1/4 text-center">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Ellipsis size={20} />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													disabled={deleteFocus ? true : false}
													className='flex items-center gap-2'
													onClick={() => handleModify(user)}
												>
													<Edit size={16} />
													Modify
												</DropdownMenuItem>
												<DropdownMenuItem
													disabled={editFocus ? true : false}
													className='flex items-center gap-2 !text-red-600 hover:!bg-red-50'
													onClick={() => handleDelete(user)}
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
			</div>
			<DeleteUserModal
				user={user}
				setUser={setUser}
				focus={deleteFocus}
				open={deleteFocus ? true : false}
				onClose={() => { setDeleteFocus(undefined); }}
				setUsers={setUsers}
			/>
			<EditUserModal
				user={user}
				setUser={setUser}
				focus={editFocus}
				open={editFocus ? true : false}
				onClose={() => { setEditFocus(undefined); }}
				setUsers={setUsers}
			/>
		</>
	);
}
