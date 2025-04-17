import { Leaf, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ChatTableEmptyProps {
	reset: () => void;
}

export default function ChatTableEmpty({ reset }: ChatTableEmptyProps) {
	return (
		<div className='flex flex-col gap-2 items-center justify-center'>
			<Leaf size={40} />
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