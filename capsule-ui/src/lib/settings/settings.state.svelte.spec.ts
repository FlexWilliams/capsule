import { expect, test } from 'vitest';
import { settingsState, settingsState$$setSelectedPodcastUrl } from './settings.state.svelte';

test('state should be defined', () => {
	const state = settingsState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = settingsState;

	expect(state.skip).toEqual(30);
});

test('settingsState$$setSelectedPodcastUrl', () => {
	const state = settingsState;

	settingsState$$setSelectedPodcastUrl(60);
	expect(state.skip).toEqual(60);
	settingsState$$setSelectedPodcastUrl(90);
	expect(state.skip).toEqual(90);
	settingsState$$setSelectedPodcastUrl(30);
	expect(state.skip).toEqual(30);
});
