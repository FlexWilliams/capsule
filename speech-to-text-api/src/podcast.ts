import child_process from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { createSrtFile, getTranscription } from './transcription';
const exec = promisify(child_process.exec);

const DEFAULT_AUDIO_DURATION = 60; // 1min

export async function downloadPodcast(podcastUrl: string): Promise<void> {
	const command = `"src/download_podcast.sh" ${podcastUrl}`;

	const { stdout, stderr } = await exec(command);

	if (stderr) {
		console.error(`Error downloading podcast, stderr: ${stderr}.`);
	} else {
		console.debug(`Download podcast script stdout: ${stdout}.`);
	}
}

export async function getPodcastDuration(): Promise<number> {
	const command = `"src/probe_podcast.sh"`;

	const { stdout, stderr } = await exec(command);

	if (stderr) {
		console.error(
			`Error probing for podcast duration, stderr: ${stderr}.
        Setting duration to ${DEFAULT_AUDIO_DURATION} seconds.`
		);

		return DEFAULT_AUDIO_DURATION;
	}

	let tokens = stdout.split('=');

	if (tokens && tokens.length >= 2 && tokens[1] && !isNaN(Number(tokens[1]))) {
		const duration = Math.ceil(Number(tokens[1]));

		console.debug(`Podcast duration: ${duration}`);

		return duration;
	}

	console.error(
		`Error probing for podcast duration, stdout: ${stdout}.
        Setting duration to ${DEFAULT_AUDIO_DURATION} seconds.`
	);

	return DEFAULT_AUDIO_DURATION;
}

export async function extractPodcastImage(): Promise<void> {
	const command = `"src/extract_podcast_image.sh"`;

	const { stdout, stderr } = await exec(command);

	if (stderr) {
		console.error(`Error extracting podcast image, stderr: ${stderr}.`);
	} else {
		console.debug(`Extract podcast image script stdout: ${stdout}.`);
	}
}

export async function createVideo(duration: number): Promise<void> {
	const command = `"src/create_video.sh" ${duration}`;

	const { stdout, stderr } = await exec(command);

	if (stderr) {
		console.error(`Error creating video, stderr: ${stderr}.`);
	} else {
		console.debug(`Create video script stdout: ${stdout}.`);
	}
}

export async function createTranscribedVideo(): Promise<void> {
	const command = `"src/create_transcribed_video.sh"`;

	const { stdout, stderr } = await exec(command);

	if (stderr) {
		console.error(`Error creating transcribed video, stderr: ${stderr}.`);
	} else {
		console.debug(`Create transcribed video script stdout: ${stdout}.`);
	}
}

export function getSegments(): string[] {
	const segments = fs.readdirSync('segments');

	console.debug(`\nSegments in directory: ${segments.length}`);

	return segments;
}

export async function transcribePodcast(podcastUrl: string): Promise<void> {
	const start = performance.now();

	await downloadPodcast(podcastUrl);

	await createSrtFile(await getTranscription(getSegments()));

	await extractPodcastImage();

	await createVideo(await getPodcastDuration());

	await createTranscribedVideo();

	console.debug(`\nDone creating video with subtitles burned in.`);

	// TODO: impl DASH and notify UI via websocket or similar.

	const end = performance.now();

	const diff = (end - start) / 1000;

	// TODO: run cleanup script

	console.debug(`Request for podcast ${podcastUrl} took ${diff}s to process.`);
}
