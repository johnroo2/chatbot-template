import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { BaseProps } from '@/pages/_app';

export default function NotFound({ user }: BaseProps){

	const router = useRouter();

	useEffect(() => {
		router.push(user ? '/dashboard' : '/');
		toast.warning('Page not found', {
			description: 'Sending you back home...'
		});
	}, [router, user]);

	return (
		<></>
	);
}