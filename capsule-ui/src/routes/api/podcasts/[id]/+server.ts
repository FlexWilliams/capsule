import { mockPodcasts } from '#lib/podcast/model/mock.ts';
import type { RequestHandler } from '@sveltejs/kit';

type PodcastIndexPodcast = {
	podcastGuid: string;
	title: string;
	image: string;
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

		const podcast = {
			id: rawPodcast.podcastGuid,
			name: rawPodcast.title,
			imageUrl: rawPodcast.image
		};

		return new Response(JSON.stringify(podcast), { status: 200 });
	} catch (e) {
		console.error(`Error fetching podcasts from "podcastindex.org".\n${JSON.stringify(e)}`);

		return new Response(JSON.stringify([]), { status: 200 });
	}
};
