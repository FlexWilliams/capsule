import fsAsync from 'node:fs/promises';
import path from 'node:path';
import { TranscriptionService } from './transcription-service';
import Audio2TextJS from './vendor/Audio2Text';
import { Audio2TextJSResult, WhipserItem, WhisperTranscription } from './whisper';

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
};

/**
 * TODO: perf this better via message queue or
 * pipe each file once processed via whisper.
 *
 * Typically takes ~5min on cube for an hour-long podcast.
 *
 */
export async function getTranscription(
	url: string,
	directUrl: string,
	clientId: string,
	podcastId: string,
	segments: string[]
): Promise<WhisperTranscription[]> {
	const transcript: WhisperTranscription[] = [];

	let offset = 0;

	for (const s of segments) {
		console.log(`Processing segment: ${s} (out of ${segments.length})`);

		const filePath = path.join(__dirname, '../tmp', `${podcastId}`, `segments/${s}`);

		const transciptions = await transcribe(filePath);

		if (transciptions) {
			const t = transciptions.map((tr) => {
				const { timestamps } = tr;

				return {
					...tr,
					timestamps: {
						from: offsetTimestamp(timestamps.from, offset),
						fromInSeconds: offsetTimestampInSeconds(timestamps.from, offset),
						to: offsetTimestamp(timestamps.to, offset),
						toInSeconds: offsetTimestampInSeconds(timestamps.to, offset)
					},
					text: tr.text.trim()
				} as WhisperTranscription;
			});

			TranscriptionService.emitTranscription({ url, directUrl, clientId, transcriptions: t });

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

function offsetTimestampInSeconds(timestamp: string, offset: number): number {
	const tokens = timestamp.split(',');
	if (tokens.length !== 2) {
		console.error(`Invalid timestamp: ${timestamp}. Returning 0s`);

		return 0;
	}
	const minor = Number(`0.${tokens[1]}`);

	const major = tokens[0]?.split(':');
	if (!major || major.length !== 3) {
		console.error(`Invalid timestamp: ${timestamp}. Returning 0s`);

		return 0;
	}

	let [hours, minutes, seconds] = major.map((m) => Number(m));

	if (hours === undefined || minutes === undefined || seconds === undefined) {
		return 0;
	}

	const hoursToSeconds = hours * 60 * 60;
	const minutesToSeconds = minutes * 60 * 60;

	let totalSeconds = seconds + minutesToSeconds + hoursToSeconds + offset;

	if (!isNaN(minor)) {
		totalSeconds += minor;
	} else {
		totalSeconds += 0.65;
	}

	return Number(totalSeconds.toFixed(3));
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

async function transcribe(filePath: string): Promise<WhisperTranscription[] | null> {
	return new Promise((resolve, reject) => {
		// Example usage
		const converter = new Audio2TextJS({
			threads: 4,
			processors: 1,
			outputJson: true
		});

		const language = 'auto'; // or specify a language code for translation

		converter
			.runWhisper(filePath, language)
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

/**
 * TODO: perf this better somehow?
 */
export async function createWebVttFile(transcript: WhisperTranscription[]): Promise<void> {
	let idx = 1;

	for (let t of transcript) {
		try {
			let content = ``;

			content += `${idx}\n`;
			content += `${t.timestamps.from} --> ${t.timestamps.to}\n`;
			content += `${t.text.trim()}\n\n`;

			await fsAsync.appendFile('podcast.webvtt', content);
		} catch (err) {
			console.log(`Error writing transcript #${idx} to srt file:`);
		}

		idx++;
	}
}
