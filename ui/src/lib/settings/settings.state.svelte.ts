type SkipInterval = 30 | 60 | 90;
type SkipAdInterval = 120 | 150 | 180;

export interface SettingsState {
	/** Skip interval in seconds for fast-forward and rewind */
	skip: SkipInterval;
	skipAd: SkipAdInterval;
	lightMode: boolean;
}

const initialSettingsState: SettingsState = {
	skip: 30,
	skipAd: 120,
	lightMode: true
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
