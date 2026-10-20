type SkipInterval = 30 | 60 | 90;

export interface SettingsState {
	/** Skip interval in seconds for fast-forward and rewind */
	skip: SkipInterval;
}

const initialSettingsState: SettingsState = {
	skip: 30
};

export const settingsState = $state(initialSettingsState);

export function settingsState$$setSelectedPodcastUrl(skip: SkipInterval): void {
	settingsState.skip = skip;
}
