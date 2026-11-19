<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import PodcastViaRssCard from '#lib/podcast/components/PodcastViaRssCard.svelte';
	import type { PodcastMeta } from '#lib/podcast/model/podcast.ts';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';

	let podcasts: PodcastMeta[] = $derived(podcastState.myPodcasts);

	let loadingMyPodcasts = $derived(podcastState.loadingMyPodcasts);

	let sortedPodcasts = $derived([...podcasts]?.sort(sortByLastVisitDate));

	function sortByLastVisitDate(a: PodcastMeta, b: PodcastMeta) {
		const aDate = new SvelteDate(a.lastVisit || new Date().toISOString()).getTime();
		const bDate = new SvelteDate(b.lastVisit || new Date().toISOString()).getTime();
		if (aDate < bDate) {
			return -1;
		}
		if (aDate > bDate) {
			return 1;
		}
		return 0;
	}

	onMount(async () => {
		PodcastService.fetchMyPodcasts();
	});
</script>

<h2 class="text-center text-2xl text-text">My Podcasts</h2>

{#if loadingMyPodcasts}
	<LoadingIndicator />
{:else}
	<ul class="max-h-11/12 overflow-auto p-4">
		{#each sortedPodcasts as podcast (podcast.id)}
			<!-- TODO: REFACTOR: make into card component -->
			<li class="relative mb-4 flex h-35 flex-col rounded-md bg-card p-4 shadow-md">
				<PodcastViaRssCard {podcast} />
			</li>
		{:else}
			<li class="text-center text-text">
				<p>You aren't subscribed to any podcasts yet!</p>

				<a href={resolve('/')} class="underline">Search for some here</a>
			</li>
		{/each}
	</ul>
{/if}
