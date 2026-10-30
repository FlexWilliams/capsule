import Audio2TextJS from 'audio2textjs';
import fsAsync from 'node:fs/promises';
import { Audio2TextJSResult, WhipserItem, WhisperTranscription } from './whisper';

export type TranscriptionRequest = {
	podcastUrl: string;
	podcastImageUrl?: string;
};

export enum TranscriptionStatus {
	Processing,
	Finished,
	Failed,
	InvalidRequest
}

export type TranscriptionResponse = {
	status: TranscriptionStatus;
	message?: string;
};

/**
 * TODO: perf this better via message queue or
 * pipe each file once processed via whisper.
 *
 * Typically takes ~5min on cube for an hour-long podcast.
 *
 */
export async function getTranscription(segments: string[]): Promise<WhisperTranscription[]> {
	const transcript: WhisperTranscription[] = [];

	let offset = 0;

	for (const s of segments) {
		console.log(`Processing segment: ${s}`);

		const transciptions = await transcribe(s);

		if (transciptions) {
			const t = transciptions.map((t) => {
				const { timestamps } = t;

				return {
					...t,
					timestamps: {
						from: offsetTimestamp(timestamps.from, offset),
						to: offsetTimestamp(timestamps.to, offset)
					}
				} as WhisperTranscription;
			});

			transcript.push(...t);
		} else {
			console.error(`Transcription failure for segment: ${s}`);
		}

		// TODO: store in constants
		// needs to match the ffmpeg `-segment_time` value done before transcription
		offset += 15;
	}

	return transcript;
}

function offsetTimestamp(timestamp: string, offset: number): string {
	const tokens = timestamp.split(',');
	if (tokens.length !== 2) {
		console.error(`Invalid timestamp: ${timestamp}. Returning 0s`);

		return '00:00:00,000';
	}

	const major = tokens[0]?.split(':');
	if (!major || major.length !== 3) {
		console.error(`Invalid timestamp: ${timestamp}. Returning 0s`);

		return '00:00:00,000';
	}

	let [hours, minutes, seconds] = major.map((m) => Number(m));

	if (hours === undefined || seconds === undefined || minutes === undefined) {
		console.error(`Invalid timestamp: ${timestamp}. Returning 0s`);

		return '00:00:00,000';
	}

	let additionalMinutes = 0;
	let additionalHours = 0;

	if (Math.fround((seconds + offset) / 60) > 1) {
		additionalMinutes = Math.floor((seconds + offset) / 60);

		seconds = (seconds + offset) % 60;
	} else {
		seconds += offset;
	}

	if (Math.fround((minutes + additionalMinutes) / 60) > 1) {
		additionalHours = Math.floor((minutes + additionalMinutes) / 60);

		minutes = (minutes + additionalMinutes) % 60;
	} else {
		minutes += additionalMinutes;
	}

	if (hours + additionalHours > 99) {
		hours = 99;
	} else {
		hours += additionalHours;
	}

	const hoursStr = hours > 9 ? `${hours}` : `0${hours}`;
	const minutesStr = minutes > 9 ? `${minutes}` : `0${minutes}`;
	const secondsStr = seconds > 9 ? `${seconds}` : `0${seconds}`;

	return `${hoursStr}:${minutesStr}:${secondsStr},${tokens[tokens.length - 1]}`;
}

async function transcribe(fileName: string): Promise<WhisperTranscription[] | null> {
	return new Promise((resolve, reject) => {
		// Example usage
		const converter = new Audio2TextJS({
			threads: 4,
			processors: 1,
			outputJson: true
		});

		const inputFile = `segments/${fileName}`;
		const model = 'tiny'; // Specify one of the available models
		const language = 'auto'; // or specify a language code for translation

		converter
			.runWhisper(inputFile, model, language)
			.then((result: Audio2TextJSResult) => {
				if (result.success) {
					const items = result.output as WhipserItem[];

					const transcription = items[0]?.data?.transcription || null;

					resolve(transcription);
				} else {
					console.error('Conversion failed:', result.message);
					resolve(null);
				}
			})
			.catch((error: Error) => {
				console.error('Error:', error);
				reject(error);
			});
	});
}

/**
 * TODO: perf this better somehow?
 */
export async function createSrtFile(transcript: WhisperTranscription[]): Promise<void> {
	let idx = 1;

	for (let t of transcript) {
		try {
			let content = ``;

			content += `${idx}\n`;
			content += `${t.timestamps.from} --> ${t.timestamps.to}\n`;
			content += `${t.text.trim()}\n\n`;

			await fsAsync.appendFile('podcast.srt', content);
		} catch (err) {
			console.log(`Error writing transcript #${idx} to srt file:`);
		}

		idx++;
	}
}
