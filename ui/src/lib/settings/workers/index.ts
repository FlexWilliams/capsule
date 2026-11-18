import type { WorkerErrorResponse } from '#lib/worker/index.ts';
import type { UserSettings } from '../model';

export type SettingsSaveRequest = {
	settings: UserSettings;
};

export type SettingsWorkerRequest = {
	load?: boolean;
	save?: SettingsSaveRequest;
};

export type SettingsLoadResponse = {
	settings: UserSettings;
};

export type SettingsSaveResponse = {
	success: boolean;
	error?: WorkerErrorResponse;
};

export type SettingsWorkerResponse = {
	load?: SettingsLoadResponse;
	save?: SettingsSaveResponse;
};
