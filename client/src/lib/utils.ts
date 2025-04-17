import { clsx, type ClassValue } from 'clsx';
import { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatBytes(
	bytes: number,
	decimals = 2,
	sizeType: 'accurate' | 'normal' = 'normal'
) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
	
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
		sizeType === 'accurate' ? accurateSizes[i] : sizes[i]
	}`;
}

export function stringToColor (str: string) {
	let hash = 0;
	str.split('').forEach(char => {
		hash = char.charCodeAt(0) + ((hash << 5) - hash);
	});
	let color = '#';
	for (let i = 0; i < 3; i++){
		const value = (hash >> (i * 8) & 0xff);
		color += value.toString(16).padStart(2, '0');
	}
	return color;
}

export function getAvatar (str: string) {
	let hash = 0;
	str.split('').forEach(char => {
		hash = char.charCodeAt(0) + ((hash << 5) - hash);
	});

	const [color1, color2] = [stringToColor(str.toLowerCase()), stringToColor(str.split('').reverse().join('').toUpperCase())];

	return {
		backgroundImage: `linear-gradient(${Math.abs(hash) % 360}deg, ${color1}, ${color2})`
	} as CSSProperties;
}