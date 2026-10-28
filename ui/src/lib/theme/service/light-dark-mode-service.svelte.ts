import { settingsState$$setLightMode } from '#lib/settings/settings.state.svelte.ts';

export class LightDakModeService {
	private static saveLightModePreference(): void {
		// TODO: impl during localforage
	}

	public static setLightDarkMode(lightMode: boolean): void {
		settingsState$$setLightMode(lightMode);

		this.saveLightModePreference();
	}

	public static applyLightMode(): void {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
	}

	public static applyDarkMode(): void {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
	}
}
