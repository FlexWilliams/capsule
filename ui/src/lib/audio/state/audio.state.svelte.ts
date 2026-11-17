export interface AudioState {
	isPlaying: boolean;
	isBuffering: boolean;
	muted: boolean;
	loading: boolean;
	duration: number;
	currentTime: number;
	visualizerCanvasAnimationFrameId: number;
	currentCueText: string | null;
}

const initialAudioState: AudioState = {
	isPlaying: false,
	isBuffering: false,
	muted: false,
	loading: false,
	duration: 0,
	currentTime: 0,
	visualizerCanvasAnimationFrameId: 0,
	currentCueText: null
};

export const audioState = $state(initialAudioState);

export function audioState$$setIsPlaying(isPlaying: boolean): void {
	audioState.isPlaying = isPlaying;
}

export function audioState$$setIsBuffering(isBuffering: boolean): void {
	audioState.isBuffering = isBuffering;
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

export function audioState$$setCurrentCueText(currentCueText: string | null): void {
	audioState.currentCueText = currentCueText;
}
