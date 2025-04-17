import { RefreshCcw, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PublicChatTableEmptyProps {
	reset: () => void;
}

export default function PublicChatTableEmpty({ reset }: PublicChatTableEmptyProps) {
	return (
		<div className='flex flex-col gap-2 items-center justify-center'>
			<Wind size={40} />
			<p>No results found {':('}</p>
			<Button
				size="sm"
				variant="outline"
				className='flex items-center gap-2'
				onClick={reset}
			>
				<RefreshCcw size={16} />
				Reset Filters
			</Button>
		</div>
	);
}