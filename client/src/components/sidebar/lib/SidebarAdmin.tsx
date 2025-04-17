
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';

import SidebarChildNode from './SidebarChildNode';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { SidebarNode, SidebarNodeParentProps } from '@/types/general';

interface SidebarAdminProps {
    info: SidebarNode
}

export default function SidebarAdmin({ info }: SidebarAdminProps){
	const router = useRouter();

	return (
		<Collapsible
			key={'info'}
			title={info.name}
			defaultOpen
			className="group/collapsible"
		>
			<SidebarGroup className='!py-0'>
				<SidebarGroupLabel
					asChild
					className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				>
					<CollapsibleTrigger>
						<div className='flex items-center gap-2'>
							{info.props?.icon && info.props.icon}
							{info.name}{' '}
						</div>
						<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
					</CollapsibleTrigger>
				</SidebarGroupLabel>
				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarMenu className='pl-2'>
							{(info.props as SidebarNodeParentProps).children.map((child) => <SidebarChildNode node={child} router={router}/>)}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	);
}