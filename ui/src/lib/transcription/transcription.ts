// TODO: centralize these!
// DUPED from companion api project

export type WhisperTranscription = {
	timestamps: {
		from: string;
		fromInSeconds: number;
		to: string;
		toInSeconds: number;
	};
	offsets: {
		from: number;
		to: number;
	};
	text: string;
};

export enum TextTrackFormat {
	WebVtt,
	Srt
}

export type TranscriptionRequest = {
	podcastUrl: string;
	podcastImageUrl?: string;
	textTrackFormat?: TextTrackFormat;
	video?: boolean;
};

export enum TranscriptionStatus {
	Downloading,
	Processing,
	Finished,
	Failed,
	InvalidRequest
}

export type TranscriptionResponse = {
	status: TranscriptionStatus;
	podcastUrl: string;
	directUrl?: string;
	message?: string;
	transcriptions?: WhisperTranscription[];
	percentageComplete?: number;
};
