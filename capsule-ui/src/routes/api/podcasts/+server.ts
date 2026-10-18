import { mockPodcasts } from '#lib/podcast/model/mock.ts';
import type { Podcast } from '#lib/podcast/model/podcast.ts';
import type { RequestHandler } from '@sveltejs/kit';

type PodcastIndexPodcast = {
	podcastGuid: string;
	title: string;
	image: string;
};

export const GET: RequestHandler = async ({ url }) => {
	const searchText = url.searchParams.get('q');

	if (!searchText) {
		return new Response(null, {
			status: 400,
			statusText: 'No query provided!'
		});
	}

	try {
		const mocks = mockPodcasts as PodcastIndexPodcast[];

		console.log(`Fetched ${mocks.length} podcasts via podcastindex API.`);

		const podcasts: Podcast[] = mocks
			.filter((p) =>
				searchText === '*' ? true : p.title.toLowerCase().includes(searchText.toLowerCase())
			)
			.map((p) => ({ id: p.podcastGuid, name: p.title, imageUrl: p.image }));

		return new Response(JSON.stringify(podcasts), { status: 200 });
	} catch (e) {
		console.error(`Error fetching podcasts from "podcastindex.org".\n${JSON.stringify(e)}`);

		return new Response(JSON.stringify([]), { status: 200 });
	}
};
