import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

import cookies from '@/lib/cookies';
import userService from '@/services/userService';
import { LS_KEYS } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

export default function useCurrentUser() {
	const [user, setUser] = useState<PopulatedUser>();
	const [loading, setLoading] = useState<boolean>(true);

	const refetch = async () => {
		setLoading(true);
		const token = cookies.get(LS_KEYS.token);
		if (token) {
			const response = await userService.getUser();
			if (response instanceof AxiosError) {
				setUser(undefined);
			}
			else {
				setUser(response.user);
			}
		}
		else {
			setUser(undefined);
		}
		setLoading(false);
	};

	useEffect(() => {
		refetch();
	}, []);

	return { user, setUser, userLoading: loading };
}