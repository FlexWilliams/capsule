import cors from 'cors';
import express from 'express';
import fsAsync from 'node:fs/promises';
import path from 'node:path';
import { tap } from 'rxjs';
import { WebSocket, WebSocketServer } from 'ws';
import { getDirectApiUrl, getEntry, getPodcastHash, processPodcastTranscription } from './podcast';
import {
	getSavedTranscription,
	TranscriptionRequest,
	TranscriptionResponse,
	TranscriptionStatus
} from './transcription';
import { TranscriptionService } from './transcription-service';

const wssPort = 8085;

const wss = new WebSocketServer({ port: wssPort });

const wssConnections = new Map<string, WebSocket>();

async function x(
	ws: WebSocket,
	request: TranscriptionRequest,
	podcastUrl: string,
	podcastId: string,
	clientId: string
): Promise<void> {
	const language = request.language || 'es'; // TODO: make const!

	let response: TranscriptionResponse = {
		podcastUrl,
		language,
		status: TranscriptionStatus.Processing,
		message: 'Processing podcast...'
	};

	ws.send(JSON.stringify(response));

	console.debug(`No existing entry exists for podcast: ${podcastId}.`);

	await processPodcastTranscription(request, clientId, false, false);

	if (!request.video) {
		const response: TranscriptionResponse = {
			podcastUrl,
			language,
			status: TranscriptionStatus.Finished
		};

		ws.send(JSON.stringify(response));

		return;
	}
}

// Connection event handler
wss.on('connection', (ws: WebSocket) => {
	const clientId = crypto.randomUUID();

	wssConnections.set(clientId, ws);

	console.log(`New client connected: ${clientId}`);

	ws.send(`Welcome to the WebSocket server ${clientId}!`);

	const subscription = TranscriptionService.transcription$
		.pipe(
			// filter((t) => t.clientId === clientId),
			tap((t) => {
				// TODO: refactor, hella overlat with t.{} and TranscriptionResponse!
				const response: TranscriptionResponse = {
					podcastUrl: t.url,
					directUrl: t.directUrl,
					language: t.language,
					transcriptions: t.transcriptions,
					status: t.finished ? TranscriptionStatus.Finished : TranscriptionStatus.Processing,
					percentageComplete: t.percentageComplete
				};

				console.log(`Sending out new transcription...`);

				const existing = wssConnections.get(clientId);
				if (existing) {
					existing.send(JSON.stringify(response));
				} else {
					// TODO: REVIEW: fallback but may not send to anyone
					ws.send(JSON.stringify(response));
				}
			})
		)
		.subscribe();

	ws.on('message', async (message) => {
		console.log(`Received: ${message.toString()}`);

		const request = JSON.parse(message.toString()) as TranscriptionRequest;

		const { podcastUrl } = request;

		const language = request.language ? request.language : 'es';

		if (!podcastUrl) {
			const response: TranscriptionResponse = {
				podcastUrl,
				language,
				status: TranscriptionStatus.InvalidRequest,
				message: 'Invalid request: No podcast url set.'
			};

			ws.send(JSON.stringify(response));

			return;
		}

		try {
			const podcastId = getPodcastHash(podcastUrl);

			const existingEntry = await getEntry(podcastId);

			if (existingEntry) {
				const { id, parentFolder, transcriptions } = existingEntry;

				const transcriptionMap = new Map(transcriptions);

				const t = transcriptionMap.get(language);

				if (!t) {
					x(ws, request, podcastUrl, podcastId, clientId);

					return;
				}

				const status = t ? t.status : TranscriptionStatus.InvalidRequest;

				if (status === TranscriptionStatus.Finished) {
					console.debug(
						`Existing entry already exists for podcast: ${podcastUrl}. Returning entry.`
					);

					const transcriptions = await getSavedTranscription(`${parentFolder}/${id}`, language);

					const response_: TranscriptionResponse = {
						podcastUrl,
						language,
						directUrl: getDirectApiUrl(id),
						status: TranscriptionStatus.Finished,
						transcriptions,
						percentageComplete: 100
					};

					ws.send(JSON.stringify(response_));

					return;
				} else if (status === TranscriptionStatus.Downloading) {
					console.debug(
						`Podcast previously downloaded but no transcriptions exist yet. Processing...`
					);

					await processPodcastTranscription(request, clientId, false, false);
				} else {
					console.error(`Entry found, but invalid data. Returning...`);

					return;
				}
			} else {
				await x(ws, request, podcastUrl, podcastId, clientId);
			}
		} catch (e) {
			console.error(
				`Error occurred transcribing the podcast with url: ${podcastUrl}.\n${JSON.stringify(e)}`
			);

			let response: TranscriptionResponse = {
				podcastUrl,
				language,
				status: TranscriptionStatus.Failed,
				message: `Error occurred transcribing the podcast with url: ${podcastUrl}`
			};

			ws.send(JSON.stringify(response));
		}
	});

	ws.on('close', () => {
		subscription.unsubscribe();

		wssConnections.delete(clientId);

		console.log('Client disconnected');
	});
});

const app = express();

app.use(express.json());

app.use(
	cors(
		/*
		TODO: [SECURITY] restrict to dev and prod clients!
		
		origin: 'http://localhost:5173/',
		optionsSuccessStatus: 200
		*/ {}
	)
);

app.post('/transcribe', async (req, res) => {
	const request = req.body as TranscriptionRequest;

	const { podcastUrl } = request;

	// TODO: improve validation here and update to use regex
	if (!podcastUrl || (!podcastUrl.startsWith(`http://`) && !podcastUrl.startsWith(`https://`))) {
		return res.status(400).send('Bad Request');
	}

	processPodcastTranscription(request, '');

	res.status(202).send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

export type ViaUrlRequest = {
	url: string;
	clientId: string;
	noTranscribe: boolean;
};

app.post('/via-url', async (req, res) => {
	const request = req.body as ViaUrlRequest;

	const { url, clientId, noTranscribe } = request;

	// TODO: improve validation here and update to use regex
	if (!url || (!url.startsWith(`http://`) && !url.startsWith(`https://`))) {
		return res.status(400).send('Bad Request');
	}

	let directUrl = '';

	const existingEntry = await getEntry(getPodcastHash(url));

	if (existingEntry) {
		console.log('Podcast previously downloaded, reusing existing entry.');

		directUrl = getDirectApiUrl(existingEntry.id);
	} else {
		console.log('No entry exists for podcast, downloading...');

		const podcastId = await processPodcastTranscription(
			{
				podcastUrl: url
			},
			clientId,
			noTranscribe,
			true
		);

		directUrl = getDirectApiUrl(podcastId);
	}

	console.log(`Returning url ${directUrl}`);

	res.status(200).send(directUrl);
});

async function accessFile(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		let retries = 0;
		const maxRetries = 5;
		const sleepTime = 2000;

		const interval = setInterval(async () => {
			retries++;

			try {
				await fsAsync.access(filePath);
				clearInterval(interval);
				resolve();
			} catch {
				console.warn(`Unable to open file ${filePath} after attempt ${retries}/${maxRetries}`);
			}

			if (retries > maxRetries) {
				clearInterval(interval);

				reject(`Unable to open the file, may not exist.`);
			}
		}, sleepTime);
	});
}

app.get('/api/podcasts/:podcastId', async (req, res) => {
	const { podcastId } = req.params;

	console.log(`[/api/podcasts/:podcastId] ${podcastId}`);

	if (!podcastId) {
		return res.status(400).send('Bad Request');
	}

	try {
		const existingEntry = await getEntry(podcastId);

		if (!existingEntry) {
			console.error(`No existing entry found for podcast: ${podcastId}`);

			return res.status(404).send();
		}

		// TODO: REVIEW extension, always assuming mp3, can set within the PodcastEntry
		const filePath = path.join(
			__dirname,
			'../tmp',
			`${existingEntry.parentFolder}/${podcastId}`,
			`podcast.mp3`
		);

		await accessFile(filePath);

		res.sendFile(filePath, (err) => {
			if (err) {
				console.error(JSON.stringify(err));

				res.status(404).send();
			}
		});
	} catch (e) {
		console.error(JSON.stringify(e));
		return res.status(404).send();
	}
});

const port = 3000;

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
