import { Logger } from '#lib/logging/logger.ts';
import { SvelteDate } from 'svelte/reactivity';
import type { Podcast } from '../model/podcast';
import {
	podcastState$$setLoadingMyPodcasts,
	podcastState$$setLoadingPodcast,
	podcastState$$setMyPodcasts,
	podcastState$$setSelectedPodcasDirectUrl,
	podcastState$$setSelectedPodcast,
	podcastState$$setSelectedPodcastUrl
} from '../state/podcast.state.svelte';
import type { PodcastsWorkerRequest, PodcastsWorkerResponse } from '../workers';

export class PodcastService {
	private static worker: Worker | undefined = undefined;

	private static handleWorkerResponse(e: MessageEvent<PodcastsWorkerResponse>): void {
		const { saveToMyPodcasts, fetchPodcast, fetchMyPodcasts, updatePodcastMeta } = e.data;

		if (saveToMyPodcasts) {
			const { success, error } = saveToMyPodcasts;

			if (!success || error) {
				// TODO: inform user to retry
				Logger.error(`Unable to save to my podcasts: ${JSON.stringify(error)}`);
			} else {
				Logger.debug(`Saved to my podcasts.`);
			}
		} else if (fetchPodcast) {
			const { podcast } = fetchPodcast;

			if (podcast) {
				podcastState$$setSelectedPodcast(podcast);
			}

			podcastState$$setLoadingPodcast(false);
		} else if (fetchMyPodcasts) {
			const { podcasts, error } = fetchMyPodcasts;

			if (error) {
				// TODO: inform user to retry
				Logger.error(`Unable to fetch my podcasts: ${JSON.stringify(error)}`);
			} else {
				podcastState$$setMyPodcasts(podcasts);

				Logger.debug(`Fetched my podcasts.`);
			}

			podcastState$$setLoadingMyPodcasts(false);
		} else if (updatePodcastMeta) {
			const { success, error } = updatePodcastMeta;

			if (!success || error) {
				Logger.error(`Unable to update podcast meta: ${JSON.stringify(error)}`);
			} else {
				Logger.debug(`Updated podcast meta.`);
			}
		}
	}

	private static async loadWorker(): Promise<void> {
		const worker = await import('#lib/podcast/workers/podcasts-worker.ts?worker');

		this.worker = new worker.default();

		this.worker.onmessage = PodcastService.handleWorkerResponse;
	}

	public static async saveToMyPodcasts(podcast: Podcast): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			saveToMyPodcasts: {
				podcast
			}
		};

		this.worker?.postMessage(request);
	}

	public static async fetchMyPodcasts(): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		podcastState$$setLoadingMyPodcasts(true);

		const request: PodcastsWorkerRequest = {
			fetchMyPodcasts: true
		};

		this.worker?.postMessage(request);
	}

	public static async updatePodcastMetrics(podcastId: string): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			updatePodcastMeta: { podcastId, lastVisit: new SvelteDate().toISOString() }
		};

		this.worker?.postMessage(request);
	}

	public static async loadPodcast(podcastId: string): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		podcastState$$setLoadingPodcast(true);

		const request: PodcastsWorkerRequest = {
			fetchPodcast: { podcastId }
		};

		this.worker?.postMessage(request);
	}

	public static setSelectedPodcast(podcast: Podcast | null): void {
		podcastState$$setSelectedPodcast(podcast);
	}

	public static setSelectedPodcastUrl(url: string): void {
		podcastState$$setSelectedPodcastUrl(url);
	}

	public static setSelectedPodcastDirectUrl(url: string | null): void {
		podcastState$$setSelectedPodcasDirectUrl(url);
	}
}
