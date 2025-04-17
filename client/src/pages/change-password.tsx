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



export default function ChangePassword({ setUser }: BaseProps) {
	const router = useRouter();

	const [username, setUsername] = useState<string>('');
	const [newPassword, setNewPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const onSubmit = async () => {
		if (!username || !newPassword || !confirmPassword) {
			toast.error('Invalid Credentials', {
				description: 'Please fill out all fields'
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('Invalid Credentials', {
				description: 'Passwords do not match'
			});
			return;
		}

		const res = await userService.changePassword(username, newPassword);

		if (res instanceof AxiosError) {
			toast.error('Password change failed', {
				description: res?.response?.data?.message || 'An unexpected error occured while attempting password change',
			});
		} else {
			cookies.set(LS_KEYS.token, res.token);
			setUser(res.user);
			toast.success('Password change successful', {
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
								Change Password
							</CardTitle>
							<CardDescription>
								If this was a production app, this would NOT be here.
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
											<Label htmlFor="newPassword">New Password</Label>
										</div>
										<PasswordInput
											id="newPassword"
											value={newPassword}
											onChange={e => {
												const { value } = e.currentTarget;

												if (value.length > MAX_PASSWORD_LENGTH) {
													setNewPassword(value.slice(0, MAX_PASSWORD_LENGTH));
												} else {
													setNewPassword(value);
												}
											}}
											required
										/>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="confirmPassword">Confirm Password</Label>
										</div>
										<PasswordInput
											id="confirmPassword"
											value={confirmPassword}
											onChange={e => {
												const { value } = e.currentTarget;

												if (value.length > MAX_PASSWORD_LENGTH) {
													setConfirmPassword(value.slice(0, MAX_PASSWORD_LENGTH));
												} else {
													setConfirmPassword(value);
												}
											}}
											required
										/>
									</div>
									<div className='flex justify-center mt-2'>
										<Button className="w-1/2" onClick={(e) => {
											e.preventDefault();
											onSubmit();
										}}>
											Change Password
										</Button>
									</div>
								</div>
							</form>
							<div className="text-center text-sm mt-2">
								Already have an account?{' '}
								<Link href="/login" className="underline underline-offset-4">
									Login
								</Link>
							</div>
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

ChangePassword.breadcrumb = JSON.stringify([{ name: 'Change Password', isLink: true, link: '/change-password' }] as BreadcrumbType[]);
