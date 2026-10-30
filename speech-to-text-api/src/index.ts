import express from 'express';
import * as WebSocket from 'ws';
import { transcribePodcast } from './podcast';
import { TranscriptionRequest, TranscriptionResponse, TranscriptionStatus } from './transcription';

const wssPort = 8085;

const wss = new WebSocket.Server({ port: wssPort });

console.log(`WebSocket server is running on ws://localhost:${wssPort}`);

// Connection event handler
wss.on('connection', (ws) => {
	console.log('New client connected');

	// Send a welcome message to the client
	ws.send('Welcome to the WebSocket server!');

	// Message event handler
	ws.on('message', async (message) => {
		console.log(`Received: ${message.toString()}`);

		const request = JSON.parse(message.toString()) as TranscriptionRequest;

		const { podcastUrl, podcastImageUrl } = request;

		if (!podcastUrl) {
			const response: TranscriptionResponse = {
				status: TranscriptionStatus.InvalidRequest,
				message: 'Invalid request: No podcast url set.'
			};

			ws.send(JSON.stringify(response));

			return;
		}

		let response: TranscriptionResponse = {
			status: TranscriptionStatus.Processing,
			message: 'Processing podcast...'
		};

		ws.send(JSON.stringify(response));

		try {
			await transcribePodcast(podcastUrl, podcastImageUrl);

			let response: TranscriptionResponse = {
				status: TranscriptionStatus.Finished,
				message: 'Finished transcribing podcast!'
			};

			ws.send(JSON.stringify(response));
		} catch (e) {
			console.error(
				`Error occurred transcribing the podcast with url: ${podcastUrl}.\n${JSON.stringify(e)}`
			);

			let response: TranscriptionResponse = {
				status: TranscriptionStatus.Failed,
				message: `Error occurred transcribing the podcast with url: ${podcastUrl}`
			};

			ws.send(JSON.stringify(response));
		}
	});

	// Close event handler
	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

const app = express();

app.use(express.json());

app.post('/transcribe', async (req, res) => {
	const { podcastUrl, podcastImageUrl } = req.body as TranscriptionRequest;

	// TODO: improve validation here and update to use regex
	if (!podcastUrl || (!podcastUrl.startsWith(`http://`) && !podcastUrl.startsWith(`https://`))) {
		return res.status(400).send('Bad Request');
	}

	transcribePodcast(podcastUrl, podcastImageUrl);

	res.status(202).send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

const port = 3000;

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
