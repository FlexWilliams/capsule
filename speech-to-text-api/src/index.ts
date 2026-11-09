import cors from 'cors';
import express from 'express';
import fsAsync from 'node:fs/promises';
import path from 'node:path';
import { filter, tap } from 'rxjs';
import { WebSocket, WebSocketServer } from 'ws';
import { getDirectApiUrl, getEntry, getPodcastHash, transcribePodcast } from './podcast';
import { TranscriptionRequest, TranscriptionResponse, TranscriptionStatus } from './transcription';
import { TranscriptionService } from './transcription-service';

const wssPort = 8085;

const wss = new WebSocketServer({ port: wssPort });

const wssConnections = new Map<string, WebSocket>();

// Connection event handler
wss.on('connection', (ws: WebSocket) => {
	const clientId = crypto.randomUUID();

	wssConnections.set(clientId, ws);

	console.log(`New client connected: ${clientId}`);

	ws.send(`Welcome to the WebSocket server ${clientId}!`);

	const subscription = TranscriptionService.transcription$
		.pipe(
			filter((t) => t.clientId === clientId),
			tap((t) => {
				const response: TranscriptionResponse = {
					podcastUrl: t.url,
					directUrl: t.directUrl,
					transcriptions: t.transcriptions,
					status: TranscriptionStatus.Processing
				};

				console.log(`Sending out new transcription...`);

				ws.send(JSON.stringify(response));
			})
		)
		.subscribe();

	ws.on('message', async (message) => {
		console.log(`Received: ${message.toString()}`);

		const request = JSON.parse(message.toString()) as TranscriptionRequest;

		const { podcastUrl } = request;

		if (!podcastUrl) {
			const response: TranscriptionResponse = {
				podcastUrl,
				status: TranscriptionStatus.InvalidRequest,
				message: 'Invalid request: No podcast url set.'
			};

			ws.send(JSON.stringify(response));

			return;
		}

		let response: TranscriptionResponse = {
			podcastUrl,
			status: TranscriptionStatus.Processing,
			message: 'Processing podcast...'
		};

		ws.send(JSON.stringify(response));

		try {
			const podcastId = getPodcastHash(podcastUrl);

			const existingEntry = await getEntry(podcastId);

			if (existingEntry) {
				console.debug(`Existing entry already exists for podcast: ${podcastUrl}. Returning entry.`);

				const response: TranscriptionResponse = {
					podcastUrl,
					directUrl: getDirectApiUrl(existingEntry.id),

					// TODO: update status here to actual from entry
					status: TranscriptionStatus.Finished
				};

				ws.send(JSON.stringify(response));

				return;
			}

			console.debug(`No existing entry already exists for podcast: ${podcastId}.`);

			await transcribePodcast(request, clientId);

			if (!request.video) {
				const response: TranscriptionResponse = {
					podcastUrl,
					status: TranscriptionStatus.Finished
				};

				ws.send(JSON.stringify(response));

				return;
			}

			const textTranscription = await fsAsync.readFile(`podcast.webvtt`, 'utf-8');

			const response: TranscriptionResponse = {
				podcastUrl,
				status: TranscriptionStatus.Finished,
				message: textTranscription
			};

			ws.send(JSON.stringify(response));
		} catch (e) {
			console.error(
				`Error occurred transcribing the podcast with url: ${podcastUrl}.\n${JSON.stringify(e)}`
			);

			let response: TranscriptionResponse = {
				podcastUrl,
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

	transcribePodcast(request, '');

	res.status(202).send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

export type ViaUrlRequest = {
	url: string;
};

app.post('/via-url', async (req, res) => {
	const request = req.body as ViaUrlRequest;

	const { url } = request;

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
		console.log('No entry exists for podcast, downloading but not transcribing...');

		const podcastId = await transcribePodcast(
			{
				podcastUrl: url
			},
			'',
			true
		);

		directUrl = getDirectApiUrl(podcastId);
	}

	console.log(`Returning url ${directUrl} for original:\n${url}`);

	res.status(200).send(directUrl);
});

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

		await fsAsync.access(filePath);

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
