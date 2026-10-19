import { expect, test } from 'vitest';
import { podcastState, podcastState$$setSelectedPodcastUrl } from './podcast.state.svelte';

test('state should be defined', () => {
	const state = podcastState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = podcastState;

	expect(state.selectedPodcastUrl).toEqual(null);
});

test('podcastState$$setSelectedPodcastUrl', () => {
	const state = podcastState;

	expect(state.selectedPodcastUrl).toEqual(null);

	const url = 'http://podcast.com/audio.mp3';
	podcastState$$setSelectedPodcastUrl(url);
	expect(state.selectedPodcastUrl).toEqual(url);
	podcastState$$setSelectedPodcastUrl(null);
	expect(state.selectedPodcastUrl).toEqual(null);
});
