import { mockPodcasts, type PodcastIndexPodcast } from '#lib/podcast/model/mock.ts';
import type { Podcast } from '#lib/podcast/model/podcast.ts';
import { db } from '#lib/server/db/index.ts';
import { podcasts as podcastDto } from '#lib/server/db/schema.ts';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const searchText = url.searchParams.get('q');

	if (!searchText) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		console.log(process.cwd());
		// Example db call, TODO: remove once ORM impld
		const d = await db.select().from(podcastDto).limit(10);
		console.log(`Example database query:`);
		console.log(d);

		const mocks = mockPodcasts as PodcastIndexPodcast[];

		console.log(`Fetched ${mocks.length} podcasts via podcastindex API.`);

		const podcasts: Podcast[] = mocks
			.filter((p) =>
				searchText === '*' ? true : p.title.toLowerCase().includes(searchText.toLowerCase())
			)
			.map((p) => ({
				id: p.podcastGuid,
				name: p.title,
				imageUrl: p.image,
				rssUrl: p.sourceFeedUrl
			}));

		return new Response(JSON.stringify(podcasts), { status: 200 });
	} catch (e) {
		console.error(`Error fetching podcasts from "podcastindex.org".\n${JSON.stringify(e)}`);

		return new Response(JSON.stringify([]), { status: 200 });
	}
};
