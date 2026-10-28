import { Subject } from 'rxjs';
import { WhisperTranscription } from './whisper';

export type Transcription = {
	url: string;
	directUrl: string;
	clientId: string;
	transcriptions: WhisperTranscription[];
};

export class TranscriptionService {
	private static transcription = new Subject<Transcription>();

	public static transcription$ = this.transcription.asObservable();

	public static emitTranscription(transcription: Transcription): void {
		this.transcription.next(transcription);
	}
}
