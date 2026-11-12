import {
	TranscriptionStatus,
	type TranscriptionResponse,
	type WhisperTranscription
} from '#lib/transcription/transcription.ts';
import { SvelteMap } from 'svelte/reactivity';
import type { Podcast, PodcastEpisode } from '../model/podcast';

export interface PodcastState {
	selectedPodcast: Podcast | null;
	selectedPodcastUrl: string | null;
	episode: PodcastEpisode | null;
	selectedPodcastDirectUrl: string | null;
	selectedPodcastTranscriptionUrl: string | null;
	episodeTranscriptionMap: Map<string, WhisperTranscription[]>;
	episodeTranscriptionRequestMap: Map<string, TranscriptionResponse | null>;
	showEpisodeTranscriptionMap: Map<string, boolean | null>;
}

const initialPodcastState: PodcastState = {
	selectedPodcast: null,
	selectedPodcastUrl: null,
	episode: null,
	selectedPodcastDirectUrl: null,
	selectedPodcastTranscriptionUrl: null,
	episodeTranscriptionMap: new Map<string, WhisperTranscription[]>(),
	episodeTranscriptionRequestMap: new Map<string, TranscriptionResponse | null>(),
	showEpisodeTranscriptionMap: new Map<string, boolean | null>()
};

export const podcastState = $state(initialPodcastState);

export function podcastState$$setSelectedPodcast(selectedPodcast: Podcast | null): void {
	podcastState.selectedPodcast = selectedPodcast;
}

export function podcastState$$setSelectedPodcastUrl(url: string | null): void {
	podcastState.selectedPodcastUrl = url;
}

export function podcastState$$setListeningEpisode(episode: PodcastEpisode | null): void {
	podcastState.episode = episode;
}

export function podcastState$$setSelectedPodcastTranscriptionUrl(url: string | null): void {
	podcastState.selectedPodcastTranscriptionUrl = url;
}
export function podcastState$$setSelectedPodcasDirectUrl(url: string | null): void {
	podcastState.selectedPodcastDirectUrl = url;
}

export function podcastState$$addEpisodeTranscriptionRequest(podcastUrl: string): void {
	podcastState.episodeTranscriptionRequestMap.set(podcastUrl, {
		podcastUrl,
		status: TranscriptionStatus.Processing
	});

	podcastState.episodeTranscriptionRequestMap = new SvelteMap(
		podcastState.episodeTranscriptionRequestMap.entries()
	);
}

export function podcastState$$setEpisodeTranscriptionRequest(
	podcastUrl: string,
	transcription: TranscriptionResponse
): void {
	podcastState.episodeTranscriptionRequestMap.set(podcastUrl, {
		...transcription
	});

	podcastState.episodeTranscriptionRequestMap = new SvelteMap(
		podcastState.episodeTranscriptionRequestMap.entries()
	);
}

export function podcastState$$resetEpisodeTranscription(podcastUrl: string): void {
	podcastState.episodeTranscriptionRequestMap.delete(podcastUrl);
}

export function podcastState$$setShowEpisodeTranscription(podcastUrl: string, show: boolean): void {
	podcastState.showEpisodeTranscriptionMap.set(podcastUrl, show);

	podcastState.showEpisodeTranscriptionMap = new SvelteMap(
		podcastState.showEpisodeTranscriptionMap.entries()
	);
}

export function podcastState$$toggleShowEpisodeTranscription(podcastUrl: string): void {
	const current = podcastState.showEpisodeTranscriptionMap.get(podcastUrl) || false;

	podcastState$$setShowEpisodeTranscription(podcastUrl, !current);
}

export function podcastState$$setDirectUrl(podcastUrl: string, directUrl: string): void {
	if (!podcastState.selectedPodcast?.episodes?.length) {
		return;
	}

	const index = podcastState.selectedPodcast?.episodes?.findIndex((e) => e.url === podcastUrl);

	if (podcastState.selectedPodcast.episodes[index]?.directUrl === directUrl) {
		return;
	}

	if (index !== -1) {
		podcastState.selectedPodcast.episodes[index] = {
			...podcastState.selectedPodcast.episodes[index],
			directUrl
		};
	}

	podcastState.selectedPodcast.episodes = [...podcastState.selectedPodcast.episodes];
}

export function podcastState$$addEpisodeTranscriptions(
	podcastUrl: string,
	transcriptions: WhisperTranscription[]
): void {
	if (!podcastState.episodeTranscriptionMap.has(podcastUrl)) {
		podcastState.episodeTranscriptionMap.set(podcastUrl, [...transcriptions]);
	} else {
		const existing = podcastState.episodeTranscriptionMap.get(podcastUrl) || [];

		podcastState.episodeTranscriptionMap.set(podcastUrl, [...existing, ...transcriptions]);
	}

	podcastState.episodeTranscriptionMap = new SvelteMap(
		podcastState.episodeTranscriptionMap.entries()
	);
}
