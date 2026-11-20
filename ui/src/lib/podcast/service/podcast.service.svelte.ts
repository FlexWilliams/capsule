import { Logger } from '#lib/logging/logger.ts';
import { SvelteDate } from 'svelte/reactivity';
import type { FavoriteEpisode, Podcast, PodcastEpisodeActivity } from '../model/podcast';
import {
	podcastState$$setEpisodeActivity,
	podcastState$$setFavorites,
	podcastState$$setLoadingEpisodeActivity,
	podcastState$$setLoadingMyPodcasts,
	podcastState$$setLoadingPodcast,
	podcastState$$setMyPodcasts,
	podcastState$$setSelectedPodcasDirectUrl,
	podcastState$$setSelectedPodcast,
	podcastState$$setSelectedPodcastUrl,
	podcastState$$setUpdatingEpisodeActivity
} from '../state/podcast.state.svelte';
import type { PodcastsWorkerRequest, PodcastsWorkerResponse } from '../workers';

export class PodcastService {
	private static worker: Worker | undefined = undefined;

	private static handleWorkerResponse(e: MessageEvent<PodcastsWorkerResponse>): void {
		const {
			saveToMyPodcasts,
			fetchPodcast,
			fetchMyPodcasts,
			updatePodcastMeta,
			unsubscribe,
			fetchEpisodeActivity,
			updateEpisodeActivity,
			fetchMyFavorites,
			favoriteEpisode,
			removeFavoriteEpisode
		} = e.data;

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
		} else if (unsubscribe) {
			const { success, error } = unsubscribe;

			if (!success || error) {
				Logger.error(`Unable to unsubscribe from podcast: ${JSON.stringify(error)}`);
			} else {
				Logger.debug(`Unsubscribed from podcast.`);
			}
		} else if (fetchEpisodeActivity) {
			const { episodeActivity, error } = fetchEpisodeActivity;

			if (error) {
				Logger.error(`Unable to fetch episode activity: ${JSON.stringify(error)}`);
			} else {
				podcastState$$setEpisodeActivity(episodeActivity);

				Logger.debug(`Fetched episode activity.`);
			}

			podcastState$$setLoadingEpisodeActivity(false);
		} else if (updateEpisodeActivity) {
			const { success, error } = updateEpisodeActivity;

			if (!success || error) {
				Logger.error(`Unable to update episode activity: ${JSON.stringify(error)}`);
			} else {
				Logger.debug(`Updated episode activity.`);
			}

			podcastState$$setUpdatingEpisodeActivity(false);
		} else if (fetchMyFavorites) {
			const { favorites, error } = fetchMyFavorites;

			if (error) {
				Logger.error(`Unable to fetch my favorites: ${JSON.stringify(error)}`);
			} else if (favorites) {
				podcastState$$setFavorites(favorites);

				Logger.debug(`Fetched my favorites.`);
			}
		} else if (favoriteEpisode) {
			const { favorites, error } = favoriteEpisode;

			if (error) {
				Logger.error(`Unable to favorite episode: ${JSON.stringify(error)}`);
			} else if (favorites) {
				podcastState$$setFavorites(favorites);

				Logger.debug(`Added episode to favorites.`);
			}
		} else if (removeFavoriteEpisode) {
			const { favorites, error } = removeFavoriteEpisode;

			if (error) {
				Logger.error(`Unable to remove favorite episode: ${JSON.stringify(error)}`);
			} else if (favorites) {
				podcastState$$setFavorites(favorites);

				Logger.debug(`Removed episode from favorites.`);
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

	public static async unsubscribe(podcastId: string): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			unsubscribe: { podcastId }
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

	public static async fetchEpisodeActivity(podcastId: string, episodeId: string): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		podcastState$$setLoadingEpisodeActivity(true);

		const request: PodcastsWorkerRequest = {
			fetchEpisodeActivity: { podcastId, episodeId }
		};

		this.worker?.postMessage(request);
	}

	public static async updateTimeLeftOffAt(
		podcastId: string,
		episodeId: string,
		timeLeftOffAt: number
	): Promise<void> {
		Logger.debug(`updating podcast timeleft off at: ${timeLeftOffAt}`);
		if (!this.worker) {
			await this.loadWorker();
		}

		podcastState$$setUpdatingEpisodeActivity(true);

		const episodeActivity: Partial<PodcastEpisodeActivity> = {
			timeLeftOffAt
		};

		const request: PodcastsWorkerRequest = {
			updateEpisodeActivity: { podcastId, episodeId, episodeActivity }
		};

		this.worker?.postMessage(request);
	}

	public static async fetchMyFavorites(): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			fetchMyFavorites: { fetch: true }
		};

		this.worker?.postMessage(request);
	}

	public static async favoriteEpisode(favoriteEpisode: FavoriteEpisode): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			favoriteEpisode: { favoriteEpisode }
		};

		this.worker?.postMessage(request);
	}

	public static async removeFavoriteEpisode(podcastId: string, episodeId: string): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: PodcastsWorkerRequest = {
			removeFavoriteEpisode: { podcastId, episodeId }
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
