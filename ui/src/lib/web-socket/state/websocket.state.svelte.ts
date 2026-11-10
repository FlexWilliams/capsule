export interface WebSocketState {
	clientId: string | null;
}

const initialWebSocketState: WebSocketState = {
	clientId: null
};

export const webSocketState = $state(initialWebSocketState);

export function webSocketState$$setClientId(clientId: string | null): void {
	webSocketState.clientId = clientId;
}
