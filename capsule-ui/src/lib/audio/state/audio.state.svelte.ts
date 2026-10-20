export interface AudioState {
	isPlaying: boolean;
	loading: boolean;
}

const initialAudioState: AudioState = {
	isPlaying: false,
	loading: false
};

export const audioState = $state(initialAudioState);

export function audioState$$setIsPlaying(isPlaying: boolean): void {
	audioState.isPlaying = isPlaying;
}

export function audioState$$setLoading(loading: boolean): void {
	audioState.loading = loading;
}
