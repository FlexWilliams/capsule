<script lang="ts">
	import type { PodcastRssMeta } from '#lib/podcast/model/podcast.ts';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let podcasts: PodcastRssMeta[] = $state([]);

	async function getSavedRssPodcasts(): Promise<void> {
		// TODO: update to use localforage

		const existing = localStorage.getItem('rss-podcasts');
		if (!existing) {
			return;
		}

		podcasts = JSON.parse(existing) as PodcastRssMeta[];
	}
	onMount(async () => {
		await getSavedRssPodcasts();
	});
</script>

<h2 class="text-center text-2xl">Your Saved Rss Feeds</h2>
<ul class="py-4">
	{#each podcasts as podcast (podcast.id)}
		<!-- TODO: REFACTOR: make into card component -->
		<li class="mb-4 h-30 rounded-md bg-slate-200 p-4 shadow-md">
			<p>{podcast?.name}</p>
			<div class="flex h-8/12 max-h-8/12 items-center justify-between">
				<img src={podcast?.imageUrl} alt={`Podcast cover for ${podcast?.name}`} class="h-full" />
				<a
					href={resolve(`/podcasts/[id]?viaRss=true`, { id: podcast?.id || 'EMPTY' })}
					class="underline">Listen</a
				>
			</div>
		</li>
	{/each}
</ul>
