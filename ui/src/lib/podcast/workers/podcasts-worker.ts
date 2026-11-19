import { WorkerLogger } from '#lib/logging/logger.ts';
import {
	generatePodcastEpisodeActivityKey,
	generatePodcastKey,
	myPodcastsStorageKey
} from '#lib/storage/keys.ts';
import { StorageService } from '#lib/storage/storage-service.ts';
import { SvelteDate } from 'svelte/reactivity';
import type { PodcastsWorkerRequest, PodcastsWorkerResponse, UpdatePodcastMetaRequest } from '.';
import {
	getDefaultActivity,
	type Podcast,
	type PodcastEpisodeActivity,
	type PodcastMeta
} from '../model/podcast';

async function saveToMyPodcasts(podcast: Podcast): Promise<void> {
	try {
		if (!podcast) {
			return;
		}

		const existing = (await StorageService.getObject(generatePodcastKey(podcast.id))) as Podcast;

		const podcastSavedAlready = !!existing;

		if (podcastSavedAlready) {
			WorkerLogger.log(`[PodcastsWorker] Podcast (${podcast?.name}) already saved.`);

			const response: PodcastsWorkerResponse = {
				saveToMyPodcasts: {
					success: true
				}
			};

			postMessage(response);

			return;
		}

		await StorageService.saveObject(generatePodcastKey(podcast.id), podcast);

		let myPodcasts = (await StorageService.getListFromStorage(
			myPodcastsStorageKey
		)) as PodcastMeta[];

		myPodcasts = myPodcasts ? myPodcasts : [];

		const { id, name, rssUrl, imageUrl } = podcast;

		const podcastMeta: PodcastMeta = {
			id,
			name,
			rssUrl,
			imageUrl
		};

		myPodcasts.push(podcastMeta);

		await StorageService.saveListToStorage(myPodcastsStorageKey, myPodcasts);

		const response: PodcastsWorkerResponse = {
			saveToMyPodcasts: {
				success: true
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(`[PodcastsWorker] Error occured saving to my podcasts: ${error}.`);

		const response: PodcastsWorkerResponse = {
			saveToMyPodcasts: {
				success: false,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function fetchPodcast(podcastId: string, limit: number = 100): Promise<void> {
	try {
		const podcast = (await StorageService.getObject(generatePodcastKey(podcastId))) as Podcast;

		// TODO: simulate paging via limit, defaulting to 100
		if (podcast) {
			podcast.totalEpisodes = podcast.episodes?.length || 0;

			if (podcast.episodes) {
				podcast.episodes = podcast.episodes.slice(0, limit);
			}
		}

		const response: PodcastsWorkerResponse = {
			fetchPodcast: {
				podcast
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(`[PodcastsWorker] Error occured fetching podcast (${podcastId}): ${error}.`);

		const response: PodcastsWorkerResponse = {
			fetchPodcast: {
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function updatePodcastMeta(request: UpdatePodcastMetaRequest): Promise<void> {
	const { podcastId, lastVisit } = request;

	try {
		const podcasts = (await StorageService.getListFromStorage(
			myPodcastsStorageKey
		)) as PodcastMeta[];

		const podcastIdx = podcasts.findIndex((p) => p.id === podcastId);

		if (podcastIdx === -1) {
			const error = `Podcast not found.`;

			WorkerLogger.error(`[PodcastsWorker] Error updating podcast (${podcastId}): ${error}.`);

			const response: PodcastsWorkerResponse = {
				updatePodcastMeta: {
					success: false,
					error: {
						error
					}
				}
			};

			postMessage(response);

			return;
		}

		podcasts[podcastIdx].lastVisit = lastVisit || new SvelteDate().toISOString();

		await StorageService.saveListToStorage(myPodcastsStorageKey, podcasts);

		const response: PodcastsWorkerResponse = {
			updatePodcastMeta: {
				success: true
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(`[PodcastsWorker] Error occured updating podcast (${podcastId}): ${error}.`);

		const response: PodcastsWorkerResponse = {
			updatePodcastMeta: {
				success: false,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function unsubscribe(podcastId: string): Promise<void> {
	try {
		let podcasts =
			((await StorageService.getListFromStorage(myPodcastsStorageKey)) as PodcastMeta[]) || [];

		podcasts = podcasts.filter((p) => p.id !== podcastId);

		await StorageService.saveListToStorage(myPodcastsStorageKey, podcasts);

		const response: PodcastsWorkerResponse = {
			unsubscribe: {
				success: true
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(
			`[PodcastsWorker] Error occured unsubscribing from podcast (${podcastId}): ${error}.`
		);

		const response: PodcastsWorkerResponse = {
			unsubscribe: {
				success: false,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function fetchMyPodcasts(): Promise<void> {
	try {
		let podcasts = (await StorageService.getListFromStorage(myPodcastsStorageKey)) as PodcastMeta[];

		podcasts = podcasts ? podcasts : [];

		const response: PodcastsWorkerResponse = {
			fetchMyPodcasts: {
				podcasts
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(`[PodcastsWorker] Error occured fetching my podcasts: ${error}.`);

		const response: PodcastsWorkerResponse = {
			fetchMyPodcasts: {
				podcasts: [],
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function updateEpisodeActivity(
	podcastId: string,
	episodeId: string,
	episodeActivity: Partial<PodcastEpisodeActivity>
): Promise<void> {
	try {
		const defaultActivity = getDefaultActivity(podcastId, episodeId);

		const key = generatePodcastEpisodeActivityKey(podcastId, episodeId);

		let activity =
			((await StorageService.getObject(key)) as PodcastEpisodeActivity) || defaultActivity;

		// TODO: better validation
		activity = {
			...activity,
			...episodeActivity
		};

		await StorageService.saveObject(key, activity);

		const response: PodcastsWorkerResponse = {
			updateEpisodeActivity: {
				success: true
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(
			`[PodcastsWorker] Error occured updating podcast episode activity: ${error}.`
		);

		const response: PodcastsWorkerResponse = {
			updateEpisodeActivity: {
				success: false,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function fetchEpisodeActivity(podcastId: string, episodeId: string): Promise<void> {
	const defaultActivity = getDefaultActivity(podcastId, episodeId);

	try {
		const key = generatePodcastEpisodeActivityKey(podcastId, episodeId);

		const episodeActivity =
			((await StorageService.getObject(key)) as PodcastEpisodeActivity) || defaultActivity;

		const response: PodcastsWorkerResponse = {
			fetchEpisodeActivity: {
				episodeActivity
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(
			`[PodcastsWorker] Error occured fetching podcast episode activity: ${error}.`
		);

		const response: PodcastsWorkerResponse = {
			fetchEpisodeActivity: {
				episodeActivity: defaultActivity,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

onmessage = async (e: MessageEvent<PodcastsWorkerRequest>) => {
	const {
		saveToMyPodcasts: _saveToMyPodcasts,
		fetchPodcast: _fetchPodcast,
		fetchMyPodcasts: _fetchMyPodcasts,
		updatePodcastMeta: _updatePodcastMeta,
		unsubscribe: _unsubscribe,
		fetchEpisodeActivity: _fetchEpisodeActivity,
		updateEpisodeActivity: _updateEpisodeActivity
	} = e.data;

	await StorageService.init();

	if (_saveToMyPodcasts) {
		await saveToMyPodcasts(_saveToMyPodcasts.podcast);
	} else if (_fetchPodcast) {
		await fetchPodcast(_fetchPodcast.podcastId);
	} else if (_fetchMyPodcasts) {
		await fetchMyPodcasts();
	} else if (_updatePodcastMeta) {
		await updatePodcastMeta(_updatePodcastMeta);
	} else if (_unsubscribe) {
		await unsubscribe(_unsubscribe.podcastId);
	} else if (_fetchEpisodeActivity) {
		await fetchEpisodeActivity(_fetchEpisodeActivity.podcastId, _fetchEpisodeActivity.episodeId);
	} else if (_updateEpisodeActivity) {
		const { podcastId, episodeId, episodeActivity } = _updateEpisodeActivity;
		await updateEpisodeActivity(podcastId, episodeId, episodeActivity);
	} else {
		WorkerLogger.warn(`[PodcastsWorker] Invalid operation passed in.`);
	}
};

export {};
