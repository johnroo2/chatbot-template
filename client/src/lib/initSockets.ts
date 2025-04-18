import { Socket } from 'socket.io-client';

import { SocketEvent, SocketRequest, SocketResponse, MessageResponse } from '@/types/sockets';

export const addSocketEvent = <T extends SocketEvent>(
	socket: Socket,
	event: T,
	callback: (data: SocketRequest<T>) => void
) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	socket.on(event, callback as any);
};

export const removeSocketEvent = <T extends SocketEvent>(
	socket: Socket,
	event: T,
	callback: (data: SocketRequest<T>) => void
) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	socket.off(event, callback as any);
};

export const emitSocketEvent = <T extends SocketEvent>(
	socket: Socket,
	event: T,
	data: SocketRequest<T>,
	callback?: (response: SocketResponse<T>) => void,
	timeout: number = 5000
) => {
	const timeoutId = setTimeout(() => {
		const payload: MessageResponse = {
			success: false,
			message: 'Timeout'
		};

		callback?.(payload);
	}, timeout);
	
	socket.emit(event, data, (response: SocketResponse<T>) => {
		clearTimeout(timeoutId);
		callback?.(response);
	});
};

export interface SocketListenerProps {
	updateMessage: (data: SocketRequest<SocketEvent.UpdateMessage>) => void;
	finishMessage: (data: SocketRequest<SocketEvent.FinishMessage>) => void;
}

export const initSockets = (socket: Socket, context: SocketListenerProps) => {
	addSocketEvent(socket, SocketEvent.UpdateMessage, context.updateMessage);
	addSocketEvent(socket, SocketEvent.FinishMessage, context.finishMessage);
};

export const removeSockets = (socket: Socket, context: SocketListenerProps) => {
	removeSocketEvent(socket, SocketEvent.UpdateMessage, context.updateMessage);
	removeSocketEvent(socket, SocketEvent.FinishMessage, context.finishMessage);
};
