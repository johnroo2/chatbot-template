import { AxiosError } from 'axios';
import { Atom } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, PROJECT_NAME } from '@/lib/constants';
import cookies from '@/lib/cookies';
import { BaseProps } from '@/pages/_app';
import userService from '@/services/userService';
import { BreadcrumbType, LS_KEYS } from '@/types/general';

export default function Login({ setUser }: BaseProps) {
	const router = useRouter();

	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const onSubmit = async () => {
		if (!username || !password) {
			toast.error('Invalid credentials', {
				description: 'Please fill out all fields',
			});
			return;
		}

		const res = await userService.login(username, password);

		if (res instanceof AxiosError) {
			toast.error('Login failed', {
				description: res?.response?.data?.message || 'An unexpected error occured while attempting login',
			});
		} else {
			cookies.set(LS_KEYS.token, res.token);
			setUser(res.user);
			toast.success('Login successful', {
				description: `Welcome back to ${PROJECT_NAME} ☀️`
			});
			router.push('/dashboard');
		}
	};

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex flex-col gap-3">
					<Link href='/' className="flex items-center gap-2 font-medium self-center">
						<div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
							<Atom className="size-4" />
						</div>
						{PROJECT_NAME}
					</Link>
					<Card>
						<CardHeader className='text-center'>
							<CardTitle className="flex items-center gap-2 font-semibold self-center text-xl">
								{PROJECT_NAME} Login
							</CardTitle>
							<CardDescription>
								Put a description here
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={(e) => {
								e.preventDefault();
								onSubmit();
							}}>
								<div className="grid gap-3">
									<div className="grid gap-2">
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											type="username"
											value={username}
											onChange={e => {
												const { value } = e.currentTarget;

												if (value.length > MAX_USERNAME_LENGTH) {
													setUsername(value.slice(0, MAX_USERNAME_LENGTH));
												} else {
													setUsername(value);
												}
											}}
											required
										/>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="password">Password</Label>
										</div>
										<PasswordInput
											id="password"
											value={password}
											onChange={e => {
												const { value } = e.currentTarget;

												if (value.length > MAX_PASSWORD_LENGTH) {
													setPassword(value.slice(0, MAX_PASSWORD_LENGTH));
												} else {
													setPassword(value);
												}
											}}
											required
										/>
										<Link
											href="/change-password"
											className="ml-auto text-sm underline-offset-4 hover:underline"
										>
											Forgot your password?
										</Link>
									</div>
									<div className='flex justify-center mt-2'>
										<Button className="w-1/2" onClick={(e) => {
											e.preventDefault();
											onSubmit();
										}}>
											Login
										</Button>
									</div>
								</div>
							</form>
							<div className="text-center text-sm mt-2">
								Don&apos;t have an account?{' '}
								<Link href="/signup" className="underline underline-offset-4">
									Sign up
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

Login.breadcrumb = JSON.stringify([{ name: 'Login', isLink: true, link: '/login' }] as BreadcrumbType[]);