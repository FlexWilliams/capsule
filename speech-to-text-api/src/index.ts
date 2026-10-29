import Audio2TextJS from 'audio2textjs';
import { exec } from 'child_process';
import express from 'express';
import fs from 'node:fs';
import fsAsync from 'node:fs/promises';

type WhisperTranscription = {
	timestamps: {
		from: string;
		to: string;
	};
	offsets: {
		from: number;
		to: number;
	};
	text: string;
};

type WhispterItemData = {
	transcription: WhisperTranscription[];
};

type WhipserItem = {
	type: string;
	data: WhispterItemData;
};

type Audio2TextJSResult = {
	success: boolean;
	output: WhipserItem[];
	message: string;
};

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
					console.log('Conversion successful:', result.output);

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

const app = express();

app.use(express.json());

const port = 3000;

app.get('/', async (req, res) => {
	res.send('');
});

type TranscriptionRequest = {
	podcastUrl: string;
};

async function createSrtFile(transcript: WhisperTranscription[]): Promise<void> {
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

async function getTranscription(segments: string[]): Promise<WhisperTranscription[]> {
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

app.post('/transcribe', async (req, res) => {
	const { podcastUrl } = req.body as TranscriptionRequest;

	// TODO: improve validation here and update to use regex
	if (!podcastUrl || (!podcastUrl.startsWith(`http://`) && !podcastUrl.startsWith(`https://`))) {
		return res.status(400).send('Bad Request');
	}

	// // TODO: Cache this
	// // TODO: investigate why code runs before file completely downloaded!
	// const downloadScript = fs
	//   .readFileSync("dist/download_podcast.sh", "utf8")
	//   .replace("${podcastUrl}", podcastUrl);

	const start = performance.now();

	// TODO: setup for dev/prod env via env vars
	const command = `"src/download_podcast.sh" ${podcastUrl}`;

	exec(command, async (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr:\n${stderr.trim()}`);
			res.status(500).send();
		}

		if (stdout) {
			console.log(`stdout:\n${stdout.trim()}`);
		}

		let segments = fs.readdirSync('segments');

		console.debug(`\nSegments in directory: ${segments.length}`);

		/**
		 * TODO: perf this better via message queue or
		 * pipe each file once processed via whisper.
		 *
		 * Typically takes ~5min on cube for an hour-long podcast.
		 *
		 */
		const transcript = await getTranscription(segments);

		/**
		 * TODO: perf this better somehow?
		 */
		await createSrtFile(transcript);

		const command = `"src/create_video.sh" ${podcastUrl}`;
		exec(command, async (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr:\n${stderr.trim()}`);
				res.status(500).send();
			}

			if (stdout) {
				console.log(`stdout:\n${stdout.trim()}`);
			}

			console.debug(`\nDone creating video with subtitles burned in.`);

			// TODO: impl DASH and notify UI via websocket or similar.

			const end = performance.now();

			const diff = (end - start) / 1000;

			console.debug(`Request for podcast ${podcastUrl} took ${diff}s to process.`);
		});
	});

	res.send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
