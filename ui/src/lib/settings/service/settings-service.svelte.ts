import { Logger } from '#lib/logging/logger.ts';
import type { UserSettings } from '../model';
import {
	settingsState$$setLoadingUserSettings,
	settingsState$$setSavingUserSettings,
	settingsState$$setUserSettings
} from '../settings.state.svelte';
import type { SettingsWorkerRequest, SettingsWorkerResponse } from '../workers';

export class SettingsService {
	private static worker: Worker | undefined = undefined;

	private static handleWorkerResponse(e: MessageEvent<SettingsWorkerResponse>): void {
		const { load, save } = e.data;

		if (load) {
			settingsState$$setUserSettings(load.settings);

			settingsState$$setLoadingUserSettings(false);
		} else if (save) {
			const { success, error } = save;

			if (!success || error) {
				// TODO: inform user to retry
				Logger.error(`Unable to save user settings: ${JSON.stringify(error)}`);
			} else {
				Logger.debug(`Saved user settings.`);
			}

			settingsState$$setSavingUserSettings(false);
		}
	}

	private static async loadWorker(): Promise<void> {
		const worker = await import('#lib/settings/workers/settings-worker.ts?worker');

		this.worker = new worker.default();

		this.worker.onmessage = SettingsService.handleWorkerResponse;
	}

	public static async loadUserSettings(): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}
		const request: SettingsWorkerRequest = { load: true };

		settingsState$$setLoadingUserSettings(true);

		this.worker?.postMessage(request);
	}

	public static async saveUserSettings(settings: UserSettings): Promise<void> {
		if (!this.worker) {
			await this.loadWorker();
		}

		const request: SettingsWorkerRequest = {
			save: {
				settings
			}
		};

		settingsState$$setSavingUserSettings(true);

		this.worker?.postMessage(request);
	}
}
