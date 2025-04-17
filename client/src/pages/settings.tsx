import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import cookies from '@/lib/cookies';
import { BaseProps } from '@/pages/_app';
import { BreadcrumbType, LS_KEYS } from '@/types/general';

export default function Settings({setUser}: BaseProps){
	const router = useRouter();

	const logout = () => {
		cookies.remove(LS_KEYS.token);
		setUser(undefined);
		router.push('/login');
		toast.success('Logged out', {
			description: 'You have been signed out'
		});
	};
      
	return (
		<div>
			<p className='text-sm'>Welcome to Settings!</p>
			<p className='text-muted-foreground text-xs'>For now, this is just an extra place to sign out</p>
			<Button onClick={logout} className='w-fit mt-2 !text-white' size='sm' variant='destructive'>
                Sign out
			</Button>
		</div>
	);
}

Settings.breadcrumb = JSON.stringify([{name: 'Settings', isLink: true, link: '/settings'}] as BreadcrumbType[]);