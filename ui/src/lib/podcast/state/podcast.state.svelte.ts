import { settingsState } from '#lib/settings/settings.state.svelte.ts';
import {
	TranscriptionStatus,
	type TranscriptionResponse,
	type WhisperTranscription
} from '#lib/transcription/transcription.ts';
import { SvelteMap } from 'svelte/reactivity';
import type {
	FavoriteEpisode,
	Podcast,
	PodcastEpisode,
	PodcastEpisodeActivity
} from '../model/podcast';

export interface PodcastState {
	selectedPodcast: Podcast | null;
	selectedPodcastUrl: string | null;
	episode: PodcastEpisode | null;
	episodeStarted: boolean;
	selectedPodcastDirectUrl: string | null;
	selectedPodcastTranscriptionUrl: string | null;
	episodeTranscriptionMap: Map<string, WhisperTranscription[]>;
	episodeTranscriptionRequestMap: Map<string, TranscriptionResponse | null>;
	showEpisodeTranscriptionMap: Map<string, boolean | null>;
	myPodcasts: Podcast[];
	loadingPodcast: boolean;
	loadingMyPodcasts: boolean;
	loadingPodcastViaRss: boolean;
	loadingEpisodeActivity: boolean;
	episodeActivity: PodcastEpisodeActivity | null;
	updatingEpisodeActivity: boolean;
	favorites: FavoriteEpisode[];
}

const initialPodcastState: PodcastState = {
	selectedPodcast: null,
	selectedPodcastUrl: null,
	episode: null,
	episodeStarted: false,
	selectedPodcastDirectUrl: null,
	selectedPodcastTranscriptionUrl: null,
	episodeTranscriptionMap: new Map<string, WhisperTranscription[]>(),
	episodeTranscriptionRequestMap: new Map<string, TranscriptionResponse | null>(),
	showEpisodeTranscriptionMap: new Map<string, boolean | null>(),
	myPodcasts: [],
	loadingPodcast: false,
	loadingMyPodcasts: false,
	loadingPodcastViaRss: false,
	episodeActivity: null,
	loadingEpisodeActivity: false,
	updatingEpisodeActivity: false,
	favorites: []
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

export function podcastState$$setEpisodeStarted(episodeStarted: boolean): void {
	podcastState.episodeStarted = episodeStarted;
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
		language: settingsState.transcriptionLanguage,
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

export function podcastState$$setMyPodcasts(podcasts: Podcast[]): void {
	podcastState.myPodcasts = podcasts;
}

export function podcastState$$setLoadingPodcast(loadingPodcast: boolean): void {
	podcastState.loadingPodcast = loadingPodcast;
}

export function podcastState$$setLoadingMyPodcasts(loadingMyPodcasts: boolean): void {
	podcastState.loadingMyPodcasts = loadingMyPodcasts;
}

export function podcastState$$setLoadingPodcastViaRss(loadingPodcastViaRss: boolean): void {
	podcastState.loadingPodcastViaRss = loadingPodcastViaRss;
}

export function podcastState$$setLoadingEpisodeActivity(loadingEpisodeActivity: boolean): void {
	podcastState.loadingEpisodeActivity = loadingEpisodeActivity;
}

export function podcastState$$setEpisodeActivity(
	episodeActivity: PodcastEpisodeActivity | null
): void {
	podcastState.episodeActivity = episodeActivity;
}

export function podcastState$$setUpdatingEpisodeActivity(updatingEpisodeActivity: boolean): void {
	podcastState.updatingEpisodeActivity = updatingEpisodeActivity;
}

export function podcastState$$setFavorites(favorites: FavoriteEpisode[]): void {
	podcastState.favorites = favorites;
}
