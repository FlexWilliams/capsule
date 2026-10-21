<script lang="ts">
	import PodcastViaRssCard from '#lib/podcast/components/PodcastViaRssCard.svelte';
	import type { PodcastRssMeta } from '#lib/podcast/model/podcast.ts';
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
		<li class="relative mb-4 flex h-35 flex-col rounded-md bg-slate-200 p-4 shadow-md">
			<PodcastViaRssCard {podcast} />
		</li>
	{/each}
</ul>
