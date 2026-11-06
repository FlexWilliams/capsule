import { ReplaySubject } from 'rxjs';
import { type WhisperTranscription } from './transcription';

export class TranscriptionService {
	private static transcription = new ReplaySubject<{
		podcastUrl: string;
		directUrl: string;
		transcriptions: WhisperTranscription[];
	}>();

	public static transcription$ = this.transcription.asObservable();

	public static emitTranscriptions(
		podcastUrl: string,
		directUrl: string | undefined,
		transcriptions: WhisperTranscription[]
	): void {
		directUrl = directUrl || ''; // TODO: fix
		this.transcription.next({ podcastUrl, directUrl, transcriptions });
	}
}
