import { mockPodcasts, type PodcastIndexPodcast } from '#lib/podcast/model/mock.ts';
import type { Podcast } from '#lib/podcast/model/podcast.ts';
import { expect, test } from '@playwright/test';

test.describe('Podcasts API', () => {
	test('should return 400 when no searchText provided', async ({ request }) => {
		const response = await request.get(`/api/podcasts`);
		expect(response.ok()).toBeFalsy();
		expect(response.status()).toBe(400);
	});

	test('should return 200 when searchText provided', async ({ request }) => {
		const response = await request.get(`/api/podcasts?q=test`);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body).toBeTruthy();
	});

	test('should return 200 with podcast(s) when searchText matches', async ({ request }) => {
		const mocks = mockPodcasts as PodcastIndexPodcast[];
		const podcast = mocks[0];
		const searchText = podcast.title.slice(0, 1);

		const response = await request.get(`/api/podcasts?q=${searchText}`);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(200);

		const podcasts = (await response.json()) as Podcast[];
		expect(podcasts).toBeTruthy();

		const found = podcasts.find((p) => p.id === podcast.podcastGuid);
		expect(found).toBeTruthy();
		expect(found?.name === podcast.title).toBeTruthy();
	});
});
