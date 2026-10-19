export interface AudioState {
	isPlaying: boolean;
}

const initialAudioState: AudioState = {
	isPlaying: false
};

export const audioState = $state(initialAudioState);

export function audioState$$setIsPlaying(isPlaying: boolean): void {
	audioState.isPlaying = isPlaying;
}
