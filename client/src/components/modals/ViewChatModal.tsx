import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PopulatedChat } from '@/types/populations';

interface ViewChatModalProps {
	open: boolean;
	onClose: () => void;
	focus?: PopulatedChat
}

export default function ViewChatModal({ open, onClose, focus }: ViewChatModalProps) {
	const [details, setDetails] = useState<PopulatedChat>();

	useEffect(() => {
		const resetTimeout = setTimeout(() => {
			setDetails(undefined);
		}, 300);

		if (!focus) return;

		clearTimeout(resetTimeout);

		setDetails(focus);
	}, [focus, open]);

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<BarChart3 />
						{details?.name || ''}: Stats
					</DialogTitle>
				</DialogHeader>
				{details &&
					<Table>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium">Chat ID</TableCell>
								<TableCell>{details.id}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Chat Name</TableCell>
								<TableCell>{details.name}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Visibility</TableCell>
								<TableCell>{details.public ? 'Public' : 'Private'}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Messages</TableCell>
								<TableCell>{details.messages.length}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Created At</TableCell>
								<TableCell>{new Date(details.createdAt).toLocaleString('en-US')}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Updated At</TableCell>
								<TableCell>{new Date(details.updatedAt).toLocaleString('en-US')}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				}
			</DialogContent>
		</Dialog>
	);
}