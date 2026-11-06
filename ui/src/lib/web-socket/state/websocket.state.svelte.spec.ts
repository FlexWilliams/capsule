import { expect, test } from 'vitest';
import { webSocketState, webSocketState$$setClientId } from './websocket.state.svelte';

test('state should be defined', () => {
	const state = webSocketState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = webSocketState;

	expect(state.clientId).toEqual(null);
	expect(state.clientId).toEqual(null);
});

test('webSocketState$$setClientId', () => {
	const state = webSocketState;

	expect(state.clientId).toEqual(null);

	webSocketState$$setClientId('');
	expect(state.clientId).toEqual('');
	webSocketState$$setClientId(null);
	expect(state.clientId).toEqual(null);
});
