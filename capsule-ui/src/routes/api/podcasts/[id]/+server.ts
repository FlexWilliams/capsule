import { mockPodcasts } from '#lib/podcast/model/mock.ts';
import type { PodcastEpisode } from '#lib/podcast/model/podcast.ts';
import { parseFeedToJson, parseFeedToSesamy } from '@sesamy/podcast-parser';
import type { RequestHandler } from '@sveltejs/kit';

type PodcastIndexPodcastSource = {
	feedId: number;
	url: string;
	host: string;
};

type PodcastIndexPodcast = {
	podcastGuid: string;
	title: string;
	image: string;
	sources: PodcastIndexPodcastSource[];
};

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) {
		return new Response(null, {
			status: 400,
			statusText: 'No id provided!'
		});
	}

	try {
		const rawPodcast = (mockPodcasts as PodcastIndexPodcast[]).find(
			(p) => p.podcastGuid.toLowerCase() === id.toLowerCase()
		);

		if (!rawPodcast) {
			return new Response(null, { status: 404 });
		}

		const firstSource = rawPodcast.sources[0]?.url;

		if (!firstSource) {
			// TODO: attempt other sources
			return new Response(null, {
				status: 404,
				statusText: 'Podcast source invalid!'
			});
		}

		const response = await fetch(firstSource);

		const xmlString = await response.text();

		const podcastFeed = await parseFeedToJson(xmlString);

		const sesamyPodcastFeed = parseFeedToSesamy(podcastFeed);

		const episodes: PodcastEpisode[] = sesamyPodcastFeed.episodes.map((e) => ({
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
			episode: e.episode,
			tags: e.tags
		}));

		const podcast = {
			id: rawPodcast.podcastGuid,
			name: rawPodcast.title,
			imageUrl: rawPodcast.image,
			episodes
		};

		return new Response(JSON.stringify(podcast), { status: 200 });
	} catch (e) {
		console.error(`Error fetching podcasts from "podcastindex.org".\n${JSON.stringify(e)}`);

		return new Response(JSON.stringify([]), { status: 200 });
	}
};
