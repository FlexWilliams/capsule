export class LightDakModeService {
	public static applyLightMode(): void {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
	}

	public static applyDarkMode(): void {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
	}
}
