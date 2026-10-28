import type { Podcast } from '../model/podcast';
import {
	podcastState$$setSelectedPodcast,
	podcastState$$setSelectedPodcastUrl
} from '../state/podcast.state.svelte';

export class PodcastService {
	public static setSelectedPodcast(podcast: Podcast | null): void {
		podcastState$$setSelectedPodcast(podcast);
	}

	public static setSelectedPodcastUrl(url: string): void {
		podcastState$$setSelectedPodcastUrl(url);
	}
}
