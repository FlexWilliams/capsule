import { expect, test } from 'vitest';
import {
	audioState,
	audioState$$setCurrentTime,
	audioState$$setDuration,
	audioState$$setIsPlaying,
	audioState$$setLoading,
	audioState$$setMuted
} from './audio.state.svelte';

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

test('audioState$$setMuted', () => {
	const state = audioState;

	expect(state.muted).toEqual(false);

	audioState$$setMuted(true);
	expect(state.muted).toEqual(true);
	audioState$$setMuted(false);
	expect(state.muted).toEqual(false);
});

test('audioState$$setLoading', () => {
	const state = audioState;

	expect(state.loading).toEqual(false);

	audioState$$setLoading(true);
	expect(state.loading).toEqual(true);
	audioState$$setLoading(false);
	expect(state.loading).toEqual(false);
});

test('audioState$$setDuration', () => {
	const state = audioState;

	expect(state.duration).toEqual(0);

	audioState$$setDuration(100);
	expect(state.duration).toEqual(100);
	audioState$$setDuration(0);
	expect(state.duration).toEqual(0);
});

test('audioState$$setCurrentTime', () => {
	const state = audioState;

	expect(state.currentTime).toEqual(0);

	audioState$$setCurrentTime(100);
	expect(state.currentTime).toEqual(100);
	audioState$$setCurrentTime(0);
	expect(state.currentTime).toEqual(0);
});
