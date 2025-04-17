import { NextRouter } from 'next/router';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarNode, SidebarNodeButtonProps, SidebarNodeLinkProps, SidebarNodeType } from '@/types/general';

interface SidebarChildNodeProps {
	router: NextRouter
	node: SidebarNode
}

export default function SidebarChildNode({ router, node }: SidebarChildNodeProps) {
	if (node.props.type === SidebarNodeType.Button) {
		const props = node.props as SidebarNodeButtonProps;

		return (
			<SidebarMenuItem key={node.name}>
				<SidebarMenuButton
					className='!py-1'
					asChild
					isActive={false}
					onClick={props.onClick}
				>
					<div className='flex items-center gap-2'>
						{props?.icon && props.icon}
						<p className='truncate'>{node.name}</p>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	else if (node.props.type === SidebarNodeType.Link) {
		const props = node.props as SidebarNodeLinkProps;

		return (
			<SidebarMenuItem key={node.name}>
				<SidebarMenuButton
					className='!py-1 !h-fit'
					asChild
					isActive={router.asPath.startsWith(props.link)}
				>
					<a href={props.link} className="w-full">
						<div className='flex items-center gap-2 w-full'>
							{props?.icon && props.icon}
							<p className='break-all'>{node.name}</p>
						</div>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	return <></>;
}