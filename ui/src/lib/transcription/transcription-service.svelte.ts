import { ReplaySubject } from 'rxjs';
import { type WhisperTranscription } from './transcription';

export class TranscriptionService {
	private static transcription = new ReplaySubject<WhisperTranscription[]>();

	public static transcription$ = this.transcription.asObservable();

	public static emitTranscriptions(transcriptions: WhisperTranscription[]): void {
		this.transcription.next(transcriptions);
	}
}
