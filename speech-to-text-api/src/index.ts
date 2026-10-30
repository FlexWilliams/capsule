import express from 'express';
import { transcribePodcast } from './podcast';
import { TranscriptionRequest } from './transcription';

const app = express();

app.use(express.json());

const port = 3000;

app.post('/transcribe', async (req, res) => {
	const { podcastUrl, podcastImageUrl } = req.body as TranscriptionRequest;

	// TODO: improve validation here and update to use regex
	if (!podcastUrl || (!podcastUrl.startsWith(`http://`) && !podcastUrl.startsWith(`https://`))) {
		return res.status(400).send('Bad Request');
	}

	transcribePodcast(podcastUrl, podcastImageUrl);

	res.status(202).send(`Processing video w/captions for podcast: ${podcastUrl}`);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
