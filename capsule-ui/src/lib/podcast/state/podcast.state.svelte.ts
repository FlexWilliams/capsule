export interface PodcastState {
	selectedPodcastUrl: string | null;
}

const initialPodcastState: PodcastState = {
	selectedPodcastUrl: null
};

export const podcastState = $state(initialPodcastState);

export function podcastState$$setSelectedPodcastUrl(url: string | null): void {
	podcastState.selectedPodcastUrl = url;
}
