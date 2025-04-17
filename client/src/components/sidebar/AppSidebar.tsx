'use client';

import {
	Atom,
	LogOut,
	User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { toast } from 'sonner';

import DisclaimerModal from '@/components/modals/DisclaimerModal';
import { SidebarAdmin, SidebarChats, SidebarInfo, SidebarLoading, SidebarMain } from '@/components/sidebar/lib/_index';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import useSidebarProps from '@/hooks/useSidebarProps';
import { PROJECT_NAME } from '@/lib/constants';
import cookies from '@/lib/cookies';
import { getAvatar } from '@/lib/utils';
import { BaseProps } from '@/pages/_app';
import { LS_KEYS, PERMISSION } from '@/types/general';

export function AppSidebar({ user, setUser, ...props }: BaseProps & React.ComponentProps<typeof Sidebar>) {
	const router = useRouter();

	const [disclaimerOpen, setDisclaimerOpen] = React.useState<boolean>(false);

	const { mainProps, adminProps, infoProps, userProps } = useSidebarProps(user, () => { setDisclaimerOpen(true); });

	const logout = () => {
		cookies.remove(LS_KEYS.token);
		setUser(undefined);
		router.push('/login');
		toast.success('Logged out', {
			description: 'You have been signed out'
		});
	};

	if (!user) return <SidebarLoading />;

	return (
		<>
			<Sidebar {...props} className='w-[250px]'>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<Link href="/dashboard">
									<div className="flex aspect-square size-8 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
										<Atom className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{PROJECT_NAME}</span>
										<span className="truncate text-xs">v1.0.0</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent className='!gap-0'>
					<SidebarMain info={mainProps} />
					<SidebarChats info={userProps} />
					{user.permissions === PERMISSION.Admin && <SidebarAdmin info={adminProps} />}
					<SidebarInfo info={infoProps} />
				</SidebarContent>
				<SidebarFooter>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className='grid grid-cols-[auto_1fr] gap-2 !h-13'
							>
								<Avatar className={'size-9 m-0.5 rounded-full'} style={getAvatar(user.username)} />
								<div className='flex flex-col'>
									<p className="truncate font-semibold">{user.username}</p>
									{user.permissions === PERMISSION.User ? (
										<Badge className='bg-sky-700 hover:bg-sky-700 flex items-center gap-1 w-fit'><User size={12} /> User</Badge>
									) : (
										<Badge className='bg-purple-700 hover:bg-purple-700 flex items-center gap-1 w-fit'><User size={12} /> Admin</Badge>
									)}
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[200px]">
							<DropdownMenuItem className='flex items-center gap-2 !text-red-600 hover:!text-red-600 hover:!bg-red-50' onClick={logout}>
								<LogOut className="mr-2 h-4 w-4 text-red-600" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarFooter>
			</Sidebar>
			<DisclaimerModal
				open={disclaimerOpen}
				onClose={() => {
					setDisclaimerOpen(false);
				}}
			/>
		</>
	);
}
