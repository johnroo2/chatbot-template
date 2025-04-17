import { Atom } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { PROJECT_NAME } from '@/lib/constants';
import { BreadcrumbType } from '@/types/general';

export default function About() {
	return (
		<Card className='w-[350px] max-w-1/2 overflow-hidden'>
			<div className='w-full h-20 peachy-gradient flex items-center justify-center'>
				<Atom size={30} className='text-white' />
			</div>
			<div className='p-4 text-sm space-y-2'>
				<p>Welcome to <b>{PROJECT_NAME}</b>!</p>
				<p>There&apos;s no real reason why this page is built the way it is, you should modify it however you see fit, or just delete it.</p>
			</div>
		</Card>
	);
}

About.breadcrumb = JSON.stringify([{ name: 'Info', isLink: false }, { name: 'About', isLink: true, link: '/about' }] as BreadcrumbType[]);