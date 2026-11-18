import { WorkerLogger } from '#lib/logging/logger.ts';
import { generatePodcastKey, myPodcastsStorageKey } from '#lib/storage/keys.ts';
import { StorageService } from '#lib/storage/storage-service.ts';
import type { PodcastsWorkerRequest, PodcastsWorkerResponse } from '.';
import type { Podcast, PodcastMeta } from '../model/podcast';

async function saveToMyPodcasts(podcast: Podcast): Promise<void> {
	try {
		if (!podcast) {
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

async function fetchPodcast(podcastId: string): Promise<void> {
	try {
		const podcast = (await StorageService.getObject(generatePodcastKey(podcastId))) as Podcast;

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

async function fetchMyPodcasts(): Promise<void> {
	try {
		let podcasts = (await StorageService.getListFromStorage(myPodcastsStorageKey)) as Podcast[];

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

onmessage = async (e: MessageEvent<PodcastsWorkerRequest>) => {
	const {
		saveToMyPodcasts: _saveToMyPodcasts,
		fetchPodcast: _fetchPodcast,
		fetchMyPodcasts: _fetchMyPodcasts
	} = e.data;

	await StorageService.init();

	if (_saveToMyPodcasts) {
		await saveToMyPodcasts(_saveToMyPodcasts.podcast);
	} else if (_fetchPodcast) {
		await fetchPodcast(_fetchPodcast.podcastId);
	} else if (_fetchMyPodcasts) {
		await fetchMyPodcasts();
	} else {
		WorkerLogger.warn(`[PodcastsWorker] Invalid operation passed in.`);
	}
};

export {};
