<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { Podcast, PodcastRssMeta } from '../../model/podcast';
	import { PodcastService } from '../../service/podcast.service.svelte';
	import { podcastState } from '../../state/podcast.state.svelte';
	import PodcastAudioButtons from './PodcastAudioButtons.svelte';
	import PodcastDetailHeader from './PodcastDetailHeader.svelte';
	import PodcastEpisodeList from './PodcastEpisodeList.svelte';
	import PodcastProgressBar from './PodcastProgressBar.svelte';

	let podcast: Podcast | null = $derived(podcastState.selectedPodcast);

	let loading = $state(true);

	async function fetchPodcastViaRss(podcastId: string): Promise<void> {
		// TODO: update to use localforage
		const existing = localStorage.getItem('rss-podcasts');
		if (!existing) {
			// TODO: display error
			loading = false;

			return;
		}

		const savedPodcasts = JSON.parse(existing) as PodcastRssMeta[];

		const found = savedPodcasts.find((s) => s.id === podcastId);
		if (!found) {
			// TODO: display error
			loading = false;

			return;
		}

		const { rssUrl } = found;

		try {
			const response = await fetch(`/api/rss`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ rssUrl })
			});

			if (!response.ok) {
				console.error(`Unable to fetch podcast with rssUrl: ${rssUrl}`);
			} else {
				PodcastService.setSelectedPodcast((await response.json()) as Podcast);
			}
		} catch (e) {
			console.error(`Unable to fetch podcast with rssUrl: ${rssUrl}.\n${JSON.stringify(e)}`);
		} finally {
			loading = false;
		}
	}

	async function fetchPodcast(): Promise<void> {
		const podcastId = page.params.id;

		if (!podcastId) {
			console.error(`Unable to load podcast, no id provided!`);

			return;
		}

		const addViaRss = page.url.searchParams.get('viaRss') === 'true';
		if (addViaRss) {
			return fetchPodcastViaRss(podcastId);
		}

		try {
			const response = await fetch(`/api/podcasts/${podcastId || ''}`);

			if (!response.ok) {
				console.error(`Unable to fetch podcast with id: ${podcastId}`);
			} else {
				PodcastService.setSelectedPodcast((await response.json()) as Podcast);
			}
		} catch (e) {
			console.error(`Unable to fetch podcast with id: ${podcastId}.\n${JSON.stringify(e)}`);
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await fetchPodcast();
	});
</script>

<article class="flex h-full flex-col items-center gap-4 py-4">
	{#if loading}
		<LoadingIndicator />
	{:else}
		{#if podcast}
			<div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
				<PodcastDetailHeader {podcast} />

				<PodcastAudioButtons {podcast} />

				<PodcastProgressBar />
			</div>

			<PodcastEpisodeList episodes={podcast?.episodes} />
		{:else}
			<p class="rounded-sm bg-amber-200 px-4 py-2 text-center">Podcast not found!</p>
			<a href={resolve('/')} class="underline">Go back Home?</a>
		{/if}
	{/if}
</article>
