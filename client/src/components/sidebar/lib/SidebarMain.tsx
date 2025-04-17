import { useRouter } from 'next/router';

import SidebarChildNode from './SidebarChildNode';

import { SidebarMenu } from '@/components/ui/sidebar';
import { SidebarNode } from '@/types/general';

interface SidebarMainProps {
    info: SidebarNode[]
}

export default function SidebarMain({ info }: SidebarMainProps){
	const router = useRouter();
    
	return info.map((child, key) => 
		<SidebarMenu>
			<div className='grid h-8 px-2' key={key}>
				<SidebarChildNode node={child} router={router}/>
			</div>
		</SidebarMenu>
	);
}