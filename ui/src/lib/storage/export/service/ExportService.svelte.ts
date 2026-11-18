import type { Podcast, PodcastMeta } from '#lib/podcast/model/podcast.ts';
import { defaultUserSettings, type UserSettings } from '#lib/settings/model/index.ts';
import { SvelteDate } from 'svelte/reactivity';
import type { DataExport } from '..';
import {
	generatePodcastKey,
	myPodcastsStorageKey,
	settingsStorageKey,
	StorageService
} from '../..';
import { exportState$$setExporting } from '../state';

export class ExportService {
	public static async handleExportData(): Promise<void> {
		exportState$$setExporting(true);

		// TODO: [PERF] offload to worker if taking too long on UI...
		const myPodcasts =
			(await StorageService.getListFromStorage<PodcastMeta>(myPodcastsStorageKey)) || [];

		const podcastKeys = myPodcasts.map((p) => generatePodcastKey(p.id));

		const podcasts: Podcast[] = [];

		for (const key of podcastKeys) {
			const podcast = (await StorageService.getObject(key)) as Podcast;

			if (podcast) {
				podcasts.push(podcast);
			}
		}

		const settings =
			((await StorageService.getObject(settingsStorageKey)) as UserSettings) || defaultUserSettings;

		const exportData: DataExport = {
			myPodcasts,
			podcasts,
			settings
		};

		const content = JSON.stringify(exportData, null, 2);
		const date = new SvelteDate().toLocaleDateString().replace(/\//g, '-');
		const a = document.createElement('a');
		const file = new Blob([content], { type: 'application/json' });
		a.href = URL.createObjectURL(file);
		a.download = `capsule-Export_${date}.json`;
		a.click();

		exportState$$setExporting(false);
	}
}
