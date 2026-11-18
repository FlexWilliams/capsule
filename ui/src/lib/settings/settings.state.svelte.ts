import type { UserSettings } from './model';

type SkipInterval = 30 | 60 | 90;
type SkipAdInterval = 120 | 150 | 180;

export interface SettingsState {
	/** Skip interval in seconds for fast-forward and rewind */
	skip: SkipInterval;
	skipAd: SkipAdInterval;
	lightMode: boolean;
	transcriptionLanguage: string;
	loadingUserSettings: boolean;
	savingUserSettings: boolean;
}

const initialSettingsState: SettingsState = {
	skip: 30,
	skipAd: 120,
	lightMode: true,
	transcriptionLanguage: 'en',
	loadingUserSettings: false,
	savingUserSettings: false
};

export const settingsState = $state(initialSettingsState);

export function settingsState$$setSkip(skip: SkipInterval): void {
	settingsState.skip = skip;
}
export function settingsState$$setSkipAd(skipAd: SkipAdInterval): void {
	settingsState.skipAd = skipAd;
}

export function settingsState$$setLightMode(lightMode: boolean): void {
	settingsState.lightMode = lightMode;
}

export function settingsState$$setTranscriptionLanguage(transcriptionLanguage: string): void {
	settingsState.transcriptionLanguage = transcriptionLanguage;
}

export function settingsState$$setUserSettings(userSettings: UserSettings): void {
	const { lightMode, transcriptionLanguage } = userSettings;

	settingsState.lightMode = lightMode;
	settingsState.transcriptionLanguage = transcriptionLanguage;
}

export function settingsState$$setLoadingUserSettings(loadingUserSettings: boolean): void {
	settingsState.loadingUserSettings = loadingUserSettings;
}

export function settingsState$$setSavingUserSettings(savingUserSettings: boolean): void {
	settingsState.savingUserSettings = savingUserSettings;
}
