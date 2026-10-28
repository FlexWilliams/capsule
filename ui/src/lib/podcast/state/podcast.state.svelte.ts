import type { Podcast } from '../model/podcast';

export interface PodcastState {
	selectedPodcast: Podcast | null;
	selectedPodcastUrl: string | null;
}

const initialPodcastState: PodcastState = {
	selectedPodcast: null,
	selectedPodcastUrl: null
};

export const podcastState = $state(initialPodcastState);

export function podcastState$$setSelectedPodcast(selectedPodcast: Podcast | null): void {
	podcastState.selectedPodcast = selectedPodcast;
}

export function podcastState$$setSelectedPodcastUrl(url: string | null): void {
	podcastState.selectedPodcastUrl = url;
}
