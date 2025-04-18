import { ScaleLoader } from 'react-spinners';

interface ChatLoaderProps {
	progress: number;
}

export default function ChatLoader({ progress }: ChatLoaderProps) {
	return (
		<>
			<div
				className="absolute inset-0 flex flex-col items-center justify-center 
       			h-full transition-all z-[400] bg-white"
				style={{
					opacity: progress > 0 ? 100 : 0,
					pointerEvents: progress > 0 ? 'auto' : 'none',
				}}
			/>
			<div
				className="absolute inset-0 flex flex-col items-center justify-center 
        		h-full transition-all duration-300 z-[500] bg-white"
				style={{
					opacity: progress > 0 ? 100 : 0,
					pointerEvents: progress > 0 ? 'auto' : 'none',
				}}
			>
				<ScaleLoader />
				<div id="loading-wave" className="text-xl mt-4">
					<span className="pr-0.5 text-zinc-800">
						Loading chat{' '}
					</span>
					<div className="dot bg-zinc-800" />
					<div className="dot bg-zinc-800" />
					<div className="dot bg-zinc-800" />
				</div>
			</div>
		</>
	);
}