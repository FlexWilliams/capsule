<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { Podcast } from '../model/podcast';
	import PodcastEpisodeCard from './PodcastEpisodeCard.svelte';

	let podcast: Podcast | null = $state(null);

	let loading = $state(true);

	async function fetchPodcast(): Promise<void> {
		const podcastId = page.params.id;

		try {
			const response = await fetch(`/api/podcasts/${podcastId || ''}`);

			if (!response.ok) {
				console.error(`Unable to fetch podcast with id: ${podcastId}`);
			} else {
				podcast = (await response.json()) as Podcast;
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
			<h2 class="text-center text-2xl">{podcast?.name}</h2>

			<img
				src={podcast?.imageUrl}
				alt={`Podcast cover for "${podcast?.name}"`}
				class="rounded-md shadow-xl"
			/>

			<ul class="max-w-full flex-2 overflow-auto">
				{#each podcast?.episodes as episode (episode?.guid)}
					<li class="mb-4 h-32 overflow-hidden rounded-md bg-slate-100">
						<PodcastEpisodeCard {episode} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-sm bg-amber-200 px-4 py-2 text-center">Podcast not found!</p>
			<a href={resolve('/')} class="underline">Go back Home?</a>
		{/if}
	{/if}
</article>

<style lang="scss">
	article {
		img {
			max-height: 10rem;
			max-width: 10rem;
		}
	}
</style>
