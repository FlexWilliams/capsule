import type { Podcast } from '#lib/podcast/model/podcast.ts';
import { parseFeedToJson, parseFeedToSesamy } from '@sesamy/podcast-parser';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { rssUrl } = await request.json();
	if (!rssUrl) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		// TODO: refactor, duped from src/routes/api/podcasts/[id]/+server.ts
		const response = await fetch(rssUrl);

		const xmlString = await response.text();

		const podcastFeed = await parseFeedToJson(xmlString);

		const sesamyPodcastFeed = parseFeedToSesamy(podcastFeed);

		const episodes = sesamyPodcastFeed.episodes.map((e) => ({
			guid: e.guid,
			title: e.title,
			subtitle: e.subtitle,
			description: e.description,
			summary: e.summary,
			url: e.url,
			link: e.link,
			image: e.image,
			duration: e.duration,
			isExplicit: e.isExplicit,
			publishDate: e.publishDate,
			contentLength: e.contentLength,
			contentLengthInMb: e.contentLength
				? Number(Math.fround(e.contentLength / 1024 / 1024).toFixed(2))
				: 0,
			episode: e.episode,
			tags: e.tags
		}));

		const podcast: Podcast = {
			id: sesamyPodcastFeed.sesamy.feedId || crypto.randomUUID(),
			name: sesamyPodcastFeed.title,
			imageUrl: sesamyPodcastFeed.image,
			rssUrl,
			episodes
		};

		return new Response(JSON.stringify(podcast), { status: 200 });
	} catch (e) {
		console.error(
			`Error occurred manually extracting rss feed for url: ${rssUrl}.\n${JSON.stringify(e)}`
		);

		return new Response(null, {
			status: 500,
			statusText: 'Error extracting rss feed. Please review and try again.'
		});
	}
};
