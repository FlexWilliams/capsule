import { expect, test } from 'vitest';
import {
	settingsState,
	settingsState$$setLightMode,
	settingsState$$setSkip,
	settingsState$$setSkipAd
} from './settings.state.svelte';

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

	settingsState$$setSkip(60);
	expect(state.skip).toEqual(60);
	settingsState$$setSkip(90);
	expect(state.skip).toEqual(90);
	settingsState$$setSkip(30);
	expect(state.skip).toEqual(30);
});
test('settingsState$$setSkipAd', () => {
	const state = settingsState;

	settingsState$$setSkipAd(120);
	expect(state.skipAd).toEqual(120);
	settingsState$$setSkipAd(150);
	expect(state.skipAd).toEqual(150);
	settingsState$$setSkipAd(180);
	expect(state.skipAd).toEqual(180);
});

test('settingsState$$setLightMode', () => {
	const state = settingsState;

	expect(state.lightMode).toEqual(true);
	settingsState$$setLightMode(false);
	expect(state.lightMode).toEqual(false);
	settingsState$$setLightMode(true);
	expect(state.lightMode).toEqual(true);
});
