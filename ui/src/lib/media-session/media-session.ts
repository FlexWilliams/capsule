export interface MediaSessionEventHandlers {
	play: () => Promise<void>;
	pause: () => Promise<void>;
	stop: () => Promise<void>;
	seekTo: (position?: number) => Promise<void>;
	enterpictureinpicture?: () => Promise<void>;
	skipad?: () => Promise<void>;
	seekBackward: () => Promise<void>;
	seekForward: () => Promise<void>;
	previousTrack: () => Promise<void>;
	nextTrack: () => Promise<void>;
}
