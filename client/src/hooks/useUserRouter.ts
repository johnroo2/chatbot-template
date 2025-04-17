import { User } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const public_routes = ['/login', '/signup', '/change-password', '/admin-signup'];
const private_routes = ['/chat', '/dashboard', '/settings', '/users', '/browse', '/changelog', '/about'];

const default_public_route = '/login';
const default_private_route = '/dashboard';

export default function useUserRouter(user: User | undefined, loading: boolean){
	const router = useRouter();

	useEffect(() => {
		const path = router.asPath;

		if (!loading){
			if (path == '/'){
				if (user){
					router.replace(default_private_route);
				} else {
					router.replace(default_public_route);
				}
			}

			if (user){
				if (public_routes.some(r => path.startsWith(r))){
					router.replace(default_private_route);
				}
			}
			else {
				if (private_routes.some(r => path.startsWith(r))){
					router.replace(default_public_route);
				}
			}
		}
	}, [user, loading, router]);
}