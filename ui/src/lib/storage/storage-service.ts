import { StorageLogger } from '#lib/logging/logger.ts';
import localForage from 'localforage';
import type { BaseObject } from '.';

export class StorageService {
	private static initialized = false;

	public static async init(): Promise<void> {
		if (this.initialized) {
			return;
		}

		localForage.config({
			driver: localForage.INDEXEDDB,
			name: 'Capsule',
			storeName: 'capsule',
			size: 1073741824, // 1GB
			description: 'Storage for the application (1GB)'
		});

		await this.initDb();

		this.initialized = true;

		StorageLogger.log('Db initialized');
	}

	public static async clear(): Promise<boolean> {
		try {
			await localForage.clear();

			StorageLogger.log('Storage cleared!');

			return true;
		} catch (e) {
			StorageLogger.error(`Error occurred clearing storage: ${JSON.stringify(e)}`);

			return false;
		}
	}

	public static async getObject<T extends BaseObject | object>(
		storageKey: string
	): Promise<T | null> {
		return await localForage.getItem<T>(storageKey);
	}

	public static async getObjectFromList<T extends BaseObject>(
		storageKey: string,
		objectId: string
	): Promise<T | null> {
		let list = await this.getListFromStorage<T>(storageKey);

		if (!list) {
			list = [];
		}

		return list.find((l) => l.id === objectId) || null;
	}

	public static async getListFromStorage<T>(storageKey: string): Promise<T[] | null> {
		const list = await localForage.getItem<T[]>(storageKey);

		if (!list) {
			StorageLogger.log(
				`The saved list for ${storageKey} was null. Ensure it was initialized via initDb()`
			);

			return null;
		} else if (!Array.isArray(list)) {
			StorageLogger.log(`Warning: the saved list was not an array. Removing item in storage.`);

			// TODO: handle in try catch or via err callback
			await localForage.removeItem(storageKey);

			return null;
		}

		return list;
	}

	public static async saveListToStorage<T extends BaseObject>(
		storageKey: string,
		data: T[]
	): Promise<boolean> {
		try {
			await localForage.setItem(storageKey, data || []).then(() => {});

			StorageLogger.log(`Item (${storageKey}) removed`);

			return true;
		} catch (e) {
			StorageLogger.error(`Error saving list to storage: ${e}`);

			return false;
		}
	}

	public static async saveObjectToList<T extends BaseObject>(
		storageKey: string,
		data: T
	): Promise<boolean> {
		let list = await this.getListFromStorage<T>(storageKey);

		if (!list) {
			list = [];
		}

		// If exists, remove and re-insert new at end
		if (list.find((l) => l.id === data.id)) {
			const filteredList = list.filter((l) => l.id !== data.id);

			filteredList.push(data);

			list = [...filteredList];
		} else {
			list.push(data);
		}

		try {
			await localForage.setItem(storageKey, list).then(() => {});

			StorageLogger.log(`Successfully saved object to list: ${data.id}`);

			return true;
		} catch (e) {
			StorageLogger.error(`Error saving object to list: ${e}`);

			return false;
		}
	}

	public static async savePrimativeToList<T>(storageKey: string, data: T): Promise<boolean> {
		let list = await this.getListFromStorage(storageKey);

		if (!list) {
			list = [];
		}

		// If exists, remove and re-insert new at end
		if (list.find((l) => l === data)) {
			const filteredList = list.filter((l) => l !== data);

			filteredList.push(data);

			list = [...filteredList];
		} else {
			list.push(data);
		}

		try {
			await localForage.setItem(storageKey, list).then(() => {});

			StorageLogger.log(`Successfully saved object to list: ${data}`);

			return true;
		} catch (e) {
			StorageLogger.error(`Error saving primative to list: ${e}`);

			return false;
		}
	}

	public static async removePrimativeFromList<T>(storageKey: string, data: T): Promise<boolean> {
		let list = await this.getListFromStorage(storageKey);

		if (!list) {
			list = [];
		}

		// If exists, remove
		if (list.find((l) => l === data)) {
			const filteredList = list.filter((l) => l !== data);

			list = [...filteredList];
		}

		try {
			await localForage.setItem(storageKey, list).then(() => {});

			StorageLogger.log(`Successfully removed primative from list: ${data}`);

			return true;
		} catch (e) {
			StorageLogger.error(`Error removing primative to list: ${e}`);

			return false;
		}
	}

	public static async saveObject<T>(storageKey: string, data: T): Promise<T> {
		return await localForage.setItem<T>(storageKey, data);
	}

	public static async removeObject(storageKey: string): Promise<boolean> {
		try {
			await localForage.removeItem(storageKey);

			StorageLogger.log(`Successfully removed object w/key: ${storageKey}`);

			return true;
		} catch (e) {
			StorageLogger.log(`Error removing object w/key: ${storageKey}\n${e}`);

			return false;
		}
	}

	public static async removeObjectFromList<T extends BaseObject>(
		storageKey: string,
		objectId: string
	): Promise<boolean> {
		const list = await this.getListFromStorage<T>(storageKey);

		if (!list) {
			StorageLogger.error(
				`Failed to remove object with id: ${objectId} from list ${storageKey}. List empty!`
			);
			return false;
		}

		const found = list.find((l) => l.id === objectId);

		if (!found) {
			return false;
		} else {
			const filteredList = list.filter((l) => l.id !== objectId);

			await this.saveListToStorage(storageKey, filteredList);

			return true;
		}
	}

	private static async initDb(): Promise<void> {
		const listsToInit: string[] = [];

		for (let i = 0; i < listsToInit.length; i++) {
			const data = await this.getListFromStorage(listsToInit[i]);

			if (!data) {
				await this.saveListToStorage(listsToInit[i], []);
			}
		}
	}
}
