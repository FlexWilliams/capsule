export interface AudioState {
	isPlaying: boolean;
	muted: boolean;
	loading: boolean;
	duration: number;
	currentTime: number;
	visualizerCanvasAnimationFrameId: number;
}

const initialAudioState: AudioState = {
	isPlaying: false,
	muted: false,
	loading: false,
	duration: 0,
	currentTime: 0,
	visualizerCanvasAnimationFrameId: 0
};

export const audioState = $state(initialAudioState);

export function audioState$$setIsPlaying(isPlaying: boolean): void {
	audioState.isPlaying = isPlaying;
}

export function audioState$$setMuted(muted: boolean): void {
	audioState.muted = muted;
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

export function audioState$$setVisualizerCanvasAnimationFrameId(
	visualizerCanvasAnimationFrameId: number
): void {
	audioState.visualizerCanvasAnimationFrameId = visualizerCanvasAnimationFrameId;
}
