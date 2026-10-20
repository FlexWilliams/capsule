export interface AudioState {
	isPlaying: boolean;
	loading: boolean;
	duration: number;
	currentTime: number;
}

const initialAudioState: AudioState = {
	isPlaying: false,
	loading: false,
	duration: 0,
	currentTime: 0
};

export const audioState = $state(initialAudioState);

export function audioState$$setIsPlaying(isPlaying: boolean): void {
	audioState.isPlaying = isPlaying;
}

export function audioState$$setLoading(loading: boolean): void {
	audioState.loading = loading;
}

export function audioState$$setDuration(duration: number): void {
	audioState.duration = duration;
}

export function audioState$$setCurrentTime(currentTime: number): void {
	audioState.currentTime = currentTime;
}
