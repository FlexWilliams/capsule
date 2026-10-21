import { Subject } from 'rxjs';
import { audioState$$setIsPlaying } from '../state/audio.state.svelte';

export enum AudioAction {
	Play,
	Pause,
	Previous,
	Next,
	Rewind,
	FastForward,
	Seek
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

	public static seek(position: number): void {
		AudioService.audio$.next({
			action: AudioAction.Seek,
			data: {
				position
			} as SeekData
		});
	}
}
