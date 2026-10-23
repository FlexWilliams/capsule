type SkipInterval = 30 | 60 | 90;

export interface SettingsState {
	/** Skip interval in seconds for fast-forward and rewind */
	skip: SkipInterval;

	lightMode: boolean;
}

const initialSettingsState: SettingsState = {
	skip: 30,
	lightMode: true
};

export const settingsState = $state(initialSettingsState);

export function settingsState$$setSelectedPodcastUrl(skip: SkipInterval): void {
	settingsState.skip = skip;
}

export function settingsState$$setLightMode(lightMode: boolean): void {
	settingsState.lightMode = lightMode;
}
