import { WorkerLogger } from '#lib/logging/logger.ts';
import { settingsStorageKey } from '#lib/storage/keys.ts';
import { StorageService } from '#lib/storage/storage-service.ts';
import type { SettingsWorkerRequest, SettingsWorkerResponse } from '.';
import { defaultUserSettings, type UserSettings } from '../model';

async function saveSettings(userSettings: UserSettings): Promise<void> {
	try {
		if (!userSettings) {
			return;
		}

		await StorageService.saveObject(settingsStorageKey, userSettings);

		const response: SettingsWorkerResponse = {
			save: {
				success: true
			}
		};

		postMessage(response);
	} catch (e) {
		const error = `${JSON.stringify(e)}`;

		WorkerLogger.error(`[SettingsWorker] Error occured saving user settings: ${error}.`);

		const response: SettingsWorkerResponse = {
			save: {
				success: false,
				error: {
					error
				}
			}
		};

		postMessage(response);
	}
}

async function loadSettings(): Promise<void> {
	const settings =
		((await StorageService.getObject(settingsStorageKey)) as UserSettings) || defaultUserSettings;

	const response: SettingsWorkerResponse = {
		load: {
			settings
		}
	};

	postMessage(response);
}

onmessage = async (e: MessageEvent<SettingsWorkerRequest>) => {
	const { load, save } = e.data;

	await StorageService.init();

	if (load) {
		await loadSettings();
	} else if (save) {
		await saveSettings(save.settings);
	} else {
		WorkerLogger.warn(`[SettingsWorker] Invalid operation passed in.`);
	}
};

export {};
