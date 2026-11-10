import { Temporal } from '@js-temporal/polyfill';
import child_process from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import {
	createSrtFile,
	createWebVttFile,
	getTranscription,
	TextTrackFormat,
	TranscriptionRequest,
	TranscriptionStatus
} from './transcription';

const exec = promisify(child_process.exec);

const DEFAULT_AUDIO_DURATION = 60; // 1min

const baseFolder = process.env.BUILD_FOLDER === 'dist' ? '/usr/src/app/dist/' : 'src/';

export async function fetchDirectPodcastUrl(podcastUrl: string): Promise<string> {
	const start = performance.now();

	const command = `"${baseFolder}fetch_direct_podcast_url.sh" ${podcastUrl}`;

	const { stderr, stdout } = await exec(command);

	let directUrl = podcastUrl;

	if (stderr) {
		console.error(`Error fetching direct podcast url, stderr: ${stderr}.`);
	}

	if (stdout) {
		const tokens = stdout.split('Direct url found to be: ');
		if (tokens && tokens.length === 2 && tokens[1] && tokens[1].toLowerCase().startsWith(`http`)) {
			const u = tokens[1].trim();

			const uTokens = u.split('\n');

			if (
				uTokens &&
				uTokens.length > 0 &&
				uTokens[0] &&
				uTokens[0]?.toLowerCase().startsWith(`http`)
			) {
				console.debug(`Multiple urls found: ${uTokens.join('\n')}`);
				console.debug(`Picking first one...`);

				directUrl = uTokens[0]?.trim() || podcastUrl;
			} else {
				directUrl = u;
			}
		}
	}

	const end = performance.now();
	const execTime = Math.ceil(end - start);

	console.debug(`Time to fetch direct podcast url: ${execTime}ms`);
	console.debug(`Direct url: ${directUrl}`);

	return directUrl;
}

function getTodaysFolderName(): string {
	const { year, month, day } = Temporal.Now.plainDateISO();

	return `${year}${month}${day}`;
}

export function getPodcastHash(url: string): string {
	return createHash('sha256').update(url).digest('hex');
}

export async function downloadPodcast(
	podcastUrl: string,
	podcastId: string,
	subFolder: string
): Promise<void> {
	const start = performance.now();

	const command = `"${baseFolder}download_podcast.sh" ${podcastId} ${podcastUrl} ${subFolder}`;

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

		return 300; // duration;
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

export function getSegments(subFolder: string): string[] {
	const folderPath = path.join(__dirname, '../tmp', `${subFolder}`, `segments`);

	const segments = fs.readdirSync(folderPath);

	console.debug(`\nSegments in directory: ${segments.length}`);

	return segments;
}

export type PodcastEntry = {
	id: string;
	parentFolder: string;
	status: TranscriptionStatus;
};

export type PodcastEntryMap = Map<string, PodcastEntry>;

async function writeEntry(
	id: string,
	parentFolder: string,
	status: TranscriptionStatus
): Promise<void> {
	try {
		const entriesPath = path.join(__dirname, '../tmp', `entries.json`);

		if (!fs.existsSync(entriesPath)) {
			await fsPromises.writeFile(
				entriesPath,
				JSON.stringify(Array.from(new Map<string, PodcastEntry>())),
				'utf8'
			);
		}

		const data = await fsPromises.readFile(entriesPath, 'utf8');

		const entries = data
			? new Map<string, PodcastEntry>(JSON.parse(data))
			: new Map<string, PodcastEntry>();

		entries.set(id, {
			id,
			parentFolder,
			status
		});

		await fsPromises.writeFile(entriesPath, JSON.stringify(Array.from(entries)), 'utf8');

		console.debug(`Wrote new entry for: ${id}`);
	} catch (error) {
		console.error('Error reading or parsing file:', error);
	}
}

export async function getEntry(id: string): Promise<PodcastEntry | undefined> {
	try {
		const entriesPath = path.join(__dirname, '../tmp', `entries.json`);

		const data = await fsPromises.readFile(entriesPath, 'utf8');

		const entries = data
			? new Map<string, PodcastEntry>(JSON.parse(data))
			: new Map<string, PodcastEntry>();

		return entries.get(id);
	} catch (error) {
		console.error('Error reading or parsing file. Will create later...');
	}
}

export function getDirectApiUrl(podcastId: string): string {
	const baseUrl = process.env.HOST_NAME || `http://localhost:3000`;

	return `${baseUrl}/api/podcasts/${podcastId}`;
}

export async function processPodcastTranscription(
	request: TranscriptionRequest,
	clientId: string,
	noTranscribe?: boolean,
	immediateDirectUrl?: boolean
): Promise<string> {
	const { podcastUrl } = request;

	const podcastId = getPodcastHash(podcastUrl);

	const existingEntry = await getEntry(podcastId);

	const start = performance.now();

	if (existingEntry) {
		const { parentFolder } = existingEntry;

		// TODO: handle check status && if web.vtt exists already! otherwise, do:
		console.info(`Transcribing podcast: ${podcastUrl}...`);

		await transcribePodcast(
			request,
			getDirectApiUrl(podcastId),
			clientId,
			`${parentFolder}/${podcastId}`,
			start
		);

		return podcastId;
	} else {
		await writeEntry(podcastId, getTodaysFolderName(), TranscriptionStatus.Processing);

		console.info(`Transcribing podcast: ${podcastUrl}...`);

		let directUrl = await fetchDirectPodcastUrl(podcastUrl);

		const subFolder = `${getTodaysFolderName()}/${podcastId}`;

		console.debug(`Saving to: ${subFolder}...`);

		await downloadPodcast(directUrl, podcastId, subFolder);

		directUrl = getDirectApiUrl(podcastId);

		if (noTranscribe) {
			return podcastId;
		}

		if (immediateDirectUrl) {
			transcribePodcast(request, directUrl, clientId, subFolder, start);
		} else {
			await transcribePodcast(request, directUrl, clientId, subFolder, start);
		}

		return podcastId;
	}
}

async function transcribePodcast(
	request: TranscriptionRequest,
	directUrl: string,
	clientId: string,
	subFolder: string,
	start: number
): Promise<void> {
	const { podcastUrl, podcastImageUrl, textTrackFormat, video } = request;

	const transcription = await getTranscription(
		podcastUrl,
		directUrl,
		clientId,
		subFolder,
		getSegments(subFolder)
	);

	if (textTrackFormat === TextTrackFormat.Srt || video) {
		if (textTrackFormat === TextTrackFormat.WebVtt) {
			console.warn(`Creating video but 'TextTrackFormat' was set to WebVtt. Using Srt instead.`);
		}

		await createSrtFile(subFolder, transcription);
	} else if (textTrackFormat === TextTrackFormat.WebVtt) {
		await createWebVttFile(subFolder, transcription);
	} else {
		console.warn(
			`An invalid 'TextTrackFormat' was sent in: ${textTrackFormat}. Creating webvtt as default.`
		);

		await createWebVttFile(subFolder, transcription);
	}

	if (!video) {
		console.info(`User requesting text-only transcription.`);
	} else {
		await extractPodcastImage(podcastImageUrl);

		await createVideo(await getPodcastDuration());

		await createTranscribedVideo();

		// TODO: impl DASH and notify UI via websocket or similar.

		// TODO: run cleanup script
	}

	const end = performance.now();

	const diff = Math.ceil(Math.ceil(end - start) / 1000);

	console.info(`Done transcribing podcast: ${podcastUrl}...`);

	console.info(`Transcription time: ${diff} (${Number(Math.fround(diff / 60).toFixed(2))})`);
}
