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

export type WhispterItemData = {
	transcription: WhisperTranscription[];
};

export type WhipserItem = {
	type: string;
	data: WhispterItemData;
};

export type Audio2TextJSResult = {
	success: boolean;
	output?: WhipserItem[];
	message: string;
};
