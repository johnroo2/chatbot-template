export type MessageResponse = {
    success: boolean,
    message: string,
}

export type UpdateMessage = {
    id: string,
    content: string,
}

export type FinishMessage = {
    id: string,
    content: string,
}

export enum SocketEvent {
    // Client to Server
    // none for now

    // Server to Client
    UpdateMessage = 'update-message',
    FinishMessage = 'finish-message',
}

interface SocketDataDefinition<
    SocketRequest = unknown | undefined,
    SocketResponse = unknown | undefined,
> {
    request: SocketRequest,
    response: SocketResponse,
}

export interface SocketDataDefinitions {
    [SocketEvent.UpdateMessage]: SocketDataDefinition<UpdateMessage, MessageResponse>
    [SocketEvent.FinishMessage]: SocketDataDefinition<FinishMessage, MessageResponse>
}

export type SocketRequest<T extends SocketEvent> = SocketDataDefinitions[T]['request']
export type SocketResponse<T extends SocketEvent> = SocketDataDefinitions[T]['response']
