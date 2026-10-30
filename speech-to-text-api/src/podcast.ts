import child_process from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { createSrtFile, getTranscription } from './transcription';
const exec = promisify(child_process.exec);

const DEFAULT_AUDIO_DURATION = 60; // 1min

const baseFolder = process.env.BUILD_FOLDER === 'dist' ? '/usr/src/app/dist/' : 'src/';

export async function downloadPodcast(podcastUrl: string): Promise<void> {
	const start = performance.now();

	const command = `"${baseFolder}download_podcast.sh" ${podcastUrl}`;

	const { stderr } = await exec(command);

	if (stderr) {
		console.error(`Error downloading podcast, stderr: ${stderr}.`);
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to download podcast: ${execTime}ms`);
}

export async function getPodcastDuration(): Promise<number> {
	const start = performance.now();

	const command = `"${baseFolder}probe_podcast.sh"`;

	const { stdout, stderr } = await exec(command);

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to probe for podcast duration: ${execTime}ms`);

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

		console.debug(`Podcast duration: ${duration}s`);

		return duration;
	}

	console.error(
		`Error probing for podcast duration, stdout: ${stdout}.
        Setting duration to ${DEFAULT_AUDIO_DURATION} seconds.`
	);

	return DEFAULT_AUDIO_DURATION;
}

export async function downloadPodcastImage(podcastImageUrl?: string): Promise<void> {
	const start = performance.now();

	const command = `"${baseFolder}download_podcast_image.sh" ${podcastImageUrl}`;

	const { stderr, stdout } = await exec(command);

	if (stderr) {
		console.error(`Error downloading podcast image, stderr: ${stderr}.`);
	}

	if (stdout) {
		console.error(`Download podcast image script, stdout: ${stdout}.`);
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to download podcast image: ${execTime}ms`);
}

export async function extractPodcastImage(podcastImageUrl?: string): Promise<void> {
	const start = performance.now();

	const command = `"${baseFolder}extract_podcast_image.sh" ${podcastImageUrl}`;

	const { stderr } = await exec(command);

	if (stderr) {
		// TODO: set default image
		console.error(`Error extracting podcast image, stderr: ${stderr}.`);

		if (podcastImageUrl) {
			await downloadPodcastImage(podcastImageUrl);
		}
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to extract podcast image: ${execTime}ms`);
}

export async function createVideo(duration: number): Promise<void> {
	console.debug(`Creating video ${duration} seconds long...`);

	const start = performance.now();

	const command = `"${baseFolder}create_video.sh" ${duration}`;

	const { stderr } = await exec(command);

	if (stderr) {
		console.error(`Error creating video, stderr: ${stderr}.`);
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to create video: ${execTime}ms`);
}

export async function createTranscribedVideo(): Promise<void> {
	console.debug(`Creating transcribed video now...`);

	const start = performance.now();

	const command = `"${baseFolder}create_transcribed_video.sh"`;

	const { stderr } = await exec(command);

	if (stderr) {
		console.error(`Error creating transcribed video, stderr: ${stderr}.`);
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to create transcribed video: ${execTime}ms`);
}

export function getSegments(): string[] {
	const segments = fs.readdirSync('segments');

	console.debug(`\nSegments in directory: ${segments.length}`);

	return segments;
}

export async function transcribePodcast(
	podcastUrl: string,
	podcastImageUrl?: string
): Promise<void> {
	console.info(`Transcribing podcast: ${podcastUrl}...`);

	const start = performance.now();

	await downloadPodcast(podcastUrl);

	await createSrtFile(await getTranscription(getSegments()));

	await extractPodcastImage(podcastImageUrl);

	await createVideo(await getPodcastDuration());

	await createTranscribedVideo();

	// TODO: impl DASH and notify UI via websocket or similar.

	const end = performance.now();

	const diff = Math.ceil(Math.ceil(end - start) / 1000);

	// TODO: run cleanup script

	console.info(`Done transcribing podcast: ${podcastUrl}...`);

	console.info(`Transcription time: ${diff} (${Number(Math.fround(diff / 60).toFixed(2))})`);
}
