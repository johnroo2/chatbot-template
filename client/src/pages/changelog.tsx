import { changelog as config_changelog } from '@/changelog.json';
import { Card } from '@/components/ui/card';
import { BreadcrumbType } from '@/types/general';

export default function Changelog(){
	return (
		<div className='grid grid-cols-2 gap-4'>
			{config_changelog.map(log => (
				<Card className='p-4 grid grid-cols-[auto_1fr] items-center gap-4' key={log.version}>
					<div className='w-8 h-8 rounded-full peachy-gradient'/>
					<div>
						<p className='text-xs text-muted-foreground'>v{log.version}</p>
						<p className='text-sm'>
							{log.header}
						</p>
						<p className='text-xs text-muted-foreground'>
							{log.description}
						</p>
					</div>
				</Card>
			))}
		</div>
	);
}

Changelog.breadcrumb = JSON.stringify([{name: 'Info', isLink: false}, {name: 'Changelog', isLink: true, link: '/changelog'}] as BreadcrumbType[]);