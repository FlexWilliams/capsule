import { Subject } from 'rxjs';
import { audioState$$setIsPlaying, audioState$$setMuted } from '../state/audio.state.svelte';

export enum AudioAction {
	Play,
	Pause,
	Previous,
	Next,
	Rewind,
	FastForward,
	Seek,
	Mute,
	Unmute,
	SkipAd
}

export type SeekData = {
	position: number;
};

export interface AudioEvent {
	action: AudioAction;
	data?: SeekData | object; // TODO: type later on
}

export class AudioService {
	private static audio$ = new Subject<AudioEvent>();

	public static audio$$ = AudioService.audio$.asObservable();

	public static play(): void {
		audioState$$setIsPlaying(true);

		AudioService.audio$.next({
			action: AudioAction.Play
		});
	}

	public static pause(): void {
		audioState$$setIsPlaying(false);

		AudioService.audio$.next({
			action: AudioAction.Pause
		});
	}

	public static previous(): void {
		AudioService.audio$.next({
			action: AudioAction.Previous
		});
	}

	public static next(): void {
		AudioService.audio$.next({
			action: AudioAction.Next
		});
	}

	public static rewind(): void {
		AudioService.audio$.next({
			action: AudioAction.Rewind
		});
	}

	public static fastForward(): void {
		AudioService.audio$.next({
			action: AudioAction.FastForward
		});
	}

	public static skipAd(): void {
		AudioService.audio$.next({
			action: AudioAction.SkipAd
		});
	}

	public static seekTo(position: number): void {
		AudioService.audio$.next({
			action: AudioAction.Seek,
			data: {
				position
			} as SeekData
		});
	}

	public static setIsPlaying(isPlaying: boolean): void {
		audioState$$setIsPlaying(isPlaying);
	}

	public static mute(): void {
		AudioService.audio$.next({
			action: AudioAction.Mute
		});

		audioState$$setMuted(true);
	}

	public static unmute(): void {
		AudioService.audio$.next({
			action: AudioAction.Unmute
		});

		audioState$$setMuted(false);
	}
}
