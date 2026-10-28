export class VibrationService {
	private static readonly DEFAULT_VIBRATION_TIME = 30;

	public static canVibrate(): boolean {
		if ('vibrate' in navigator) {
			return true;
		}

		return false;
	}

	public static vibrate(callback?: () => void, vibrationTimeInMillis?: number): void {
		if (!this.canVibrate()) {
			console.debug(`This device does not support vibrating.`);

			return;
		}

		console.debug(`Vibrating...`);

		navigator.vibrate(vibrationTimeInMillis || this.DEFAULT_VIBRATION_TIME);

		if (callback && typeof callback === 'function') {
			callback();
		}
	}
}
