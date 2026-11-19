import type { WorkerErrorResponse } from '#lib/worker/index.ts';
import type { Podcast, PodcastEpisodeActivity, PodcastMeta } from '../model/podcast';

export type SaveToMyPodcastsRequest = {
	podcast: Podcast;
};

export type FetchPodcastRequest = {
	podcastId: string;
};

export type UpdatePodcastMetaRequest = {
	podcastId: string;
	lastVisit: string;
};

export type UnsubscribeRequest = {
	podcastId: string;
};

export type FetchEpisodeActivityRequest = {
	podcastId: string;
	episodeId: string;
};

export type UpdateEpisodeActivityRequest = {
	podcastId: string;
	episodeId: string;
	episodeActivity: Partial<PodcastEpisodeActivity>;
};

export type PodcastsWorkerRequest = {
	saveToMyPodcasts?: SaveToMyPodcastsRequest;
	fetchPodcast?: FetchPodcastRequest;
	fetchMyPodcasts?: boolean;
	updatePodcastMeta?: UpdatePodcastMetaRequest;
	unsubscribe?: UnsubscribeRequest;
	fetchEpisodeActivity?: FetchEpisodeActivityRequest;
	updateEpisodeActivity?: UpdateEpisodeActivityRequest;
};

export type SaveToMyPodcastsResponse = {
	success: boolean;
	error?: WorkerErrorResponse;
};

export type FetchPodcastResponse = {
	podcast?: Podcast;
	error?: WorkerErrorResponse;
};

export type FetchMyPodcastsResponse = {
	podcasts: PodcastMeta[];
	error?: WorkerErrorResponse;
};

export type UpdatePodcastMetaResponse = {
	success: boolean;
	error?: WorkerErrorResponse;
};

export type UnsubscribeResponse = {
	success: boolean;
	error?: WorkerErrorResponse;
};

export type FetchEpisodeActivityResponse = {
	episodeActivity: PodcastEpisodeActivity;
	error?: WorkerErrorResponse;
};

export type UpdateEpisodeActivityResponse = {
	success: boolean;
	error?: WorkerErrorResponse;
};

export type PodcastsWorkerResponse = {
	saveToMyPodcasts?: SaveToMyPodcastsResponse;
	fetchPodcast?: FetchPodcastResponse;
	fetchMyPodcasts?: FetchMyPodcastsResponse;
	updatePodcastMeta?: UpdatePodcastMetaResponse;
	unsubscribe?: UnsubscribeResponse;
	fetchEpisodeActivity?: FetchEpisodeActivityResponse;
	updateEpisodeActivity?: UpdateEpisodeActivityResponse;
};
