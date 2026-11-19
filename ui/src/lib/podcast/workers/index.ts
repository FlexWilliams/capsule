import type { WorkerErrorResponse } from '#lib/worker/index.ts';
import type { Podcast, PodcastMeta } from '../model/podcast';

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

export type PodcastsWorkerRequest = {
	saveToMyPodcasts?: SaveToMyPodcastsRequest;
	fetchPodcast?: FetchPodcastRequest;
	fetchMyPodcasts?: boolean;
	updatePodcastMeta?: UpdatePodcastMetaRequest;
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

export type PodcastsWorkerResponse = {
	saveToMyPodcasts?: SaveToMyPodcastsResponse;
	fetchPodcast?: FetchPodcastResponse;
	fetchMyPodcasts?: FetchMyPodcastsResponse;
	updatePodcastMeta?: UpdatePodcastMetaResponse;
};
