import { ReplaySubject } from 'rxjs';
import { type WhisperTranscription } from './transcription';

export class TranscriptionService {
	private static transcription = new ReplaySubject<{
		podcastUrl: string;
		transcriptions: WhisperTranscription[];
	}>();

	public static transcription$ = this.transcription.asObservable();

	public static emitTranscriptions(
		podcastUrl: string,
		transcriptions: WhisperTranscription[]
	): void {
		this.transcription.next({ podcastUrl, transcriptions });
	}
}
