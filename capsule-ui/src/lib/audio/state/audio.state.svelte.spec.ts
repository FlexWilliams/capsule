import { expect, test } from 'vitest';
import { audioState, audioState$$setIsPlaying } from './audio.state.svelte';

test('state should be defined', () => {
	const state = audioState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = audioState;

	expect(state.isPlaying).toEqual(false);
});

test('audioState$$setIsPlaying', () => {
	const state = audioState;

	expect(state.isPlaying).toEqual(false);

	audioState$$setIsPlaying(true);
	expect(state.isPlaying).toEqual(true);
	audioState$$setIsPlaying(false);
	expect(state.isPlaying).toEqual(false);
});
