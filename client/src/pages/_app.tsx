import '@/styles/globals.css';
import '@/styles/general.css';

import { Home } from 'lucide-react';
import { NextComponentType, NextPageContext } from 'next';
import type { AppProps } from 'next/app';
import { Dispatch, SetStateAction } from 'react';

import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUserRouter from '@/hooks/useUserRouter';
import { BreadcrumbType } from '@/types/general';
import { PopulatedUser } from '@/types/populations';

export type BaseProps = {
	user: PopulatedUser | undefined,
	setUser: Dispatch<SetStateAction<PopulatedUser | undefined>>
	userLoading: boolean
}

export default function App({ Component, pageProps }: AppProps & { Component: NextComponentType<NextPageContext, unknown, unknown> & { breadcrumb?: string } }) {
	const { user, setUser, userLoading } = useCurrentUser();
	useUserRouter(user, userLoading);

	const customProps: BaseProps = {
		...pageProps,
		user,
		setUser,
		userLoading
	};

	const crumbs: BreadcrumbType[] = Component?.breadcrumb ? JSON.parse(Component.breadcrumb) : [];

	return (
		<>
			<SidebarProvider className="grid grid-cols-[auto_1fr] w-screen h-screen overflow-y-auto overflow-x-hidden">
				{(user || userLoading) ? <AppSidebar {...customProps} width={250} /> : <div />}
				<main className={`${(user || userLoading) && 'px-2 md:px-4'} grid grid-rows-[auto_1fr] overflow-y-auto w-full`}>
					{(user || userLoading) ?
						<header className="flex h-12 shrink-0 items-center">
							<div className="flex items-center gap-2">
								<SidebarTrigger />
								{crumbs && (
									<>
										<Separator orientation="vertical" className="mr-2 h-4" />
										<Breadcrumb>
											<BreadcrumbList className='!gap-2'>
												<BreadcrumbItem className={'block'} >
													<BreadcrumbLink href={'/dashboard'}>
														<Home size={16} />
													</BreadcrumbLink>
												</BreadcrumbItem>
												<BreadcrumbSeparator className="max-md:hidden block" />
												{crumbs.map((crumb, key, arr) => {
													if (crumb.isLink) {
														return (
															<>
																<BreadcrumbItem key={`${key}-crumb`} className={key < arr.length - 1 ? 'max-md:hidden block' : 'block'} >
																	<BreadcrumbLink href={crumb.link}>
																		{crumb.name}
																	</BreadcrumbLink>
																</BreadcrumbItem>
																{key < arr.length - 1 && <BreadcrumbSeparator key={`${key}-separator`} className="max-md:hidden block" />}
															</>
														);
													} else {
														return (
															<>
																<BreadcrumbItem key={`${key}-crumb`} className={key < arr.length - 1 ? 'max-md:hidden block' : 'block'} >
																	<BreadcrumbPage>
																		{crumb.name}
																	</BreadcrumbPage>
																</BreadcrumbItem>
																{key < arr.length - 1 && <BreadcrumbSeparator key={`${key}-separator`} className="max-md:hidden block" />}
															</>
														);
													}
												})}
											</BreadcrumbList>
										</Breadcrumb>
									</>
								)}
							</div>
						</header>
						:
						<div />
					}
					<div className="overflow-y-auto w-full">
						<Component {...customProps} />
					</div>
				</main>
			</SidebarProvider>
			<Toaster richColors closeButton />
		</>
	);
}
