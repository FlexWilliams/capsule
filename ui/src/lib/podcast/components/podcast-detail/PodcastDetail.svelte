<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import type { Podcast, PodcastEpisode } from '../../model/podcast';
	import { podcastState } from '../../state/podcast.state.svelte';
	import PodcastAudioButtons from './PodcastAudioButtons.svelte';
	import PodcastDetailHeader from './PodcastDetailHeader.svelte';
	import PodcastEpisodeList from './PodcastEpisodeList.svelte';
	import PodcastProgressBar from './PodcastProgressBar.svelte';

	let podcastId = $derived(page.params.id || '');

	let podcast: Podcast | null = $derived(podcastState.selectedPodcast);

	let loadingPodcast = $derived(podcastState.loadingPodcast);

	let episode: PodcastEpisode | null = $derived(podcastState.episode);

	// TODO: update once DB flow impld, currently all rss pods assumed "subscribed" to
	let subscribed = $state(true);

	async function fetchPodcast(): Promise<void> {
		if (!podcastId) {
			console.error(`Unable to load podcast, no id provided!`);

			return;
		}

		PodcastService.loadPodcast(podcastId);
	}

	function handleSubscribeToggle(): void {
		PodcastService.unsubscribe(podcastId);

		subscribed = false;
	}

	$effect(() => {
		if (podcast) {
			untrack(async () => {
				console.log(`Playlist visited!`);

				PodcastService.updatePodcastMetrics(podcastId);
			});
		}
	});

	onMount(async () => {
		if (!podcast || podcast.id !== podcastId) {
			await fetchPodcast();
		}
	});
</script>

<article class="flex h-full flex-col items-center gap-4 py-4">
	{#if loadingPodcast}
		<LoadingIndicator />
	{:else}
		{#if podcast}
			<div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
				<PodcastDetailHeader {podcast} {subscribed} {handleSubscribeToggle} />

				<PodcastAudioButtons {podcast} />

				<p class="podcast-title max-h-126 min-h-12 w-11/12 text-center text-text">
					{#if episode}
						{episode?.title || `[Unknown Episode]`}
					{/if}
				</p>

				<PodcastProgressBar />
			</div>

			<PodcastEpisodeList
				episodes={podcast?.episodes}
				podcastTitle={podcast?.name || '[Unknown Podcast]'}
			/>
		{:else}
			<p class="rounded-sm bg-amber-200 px-4 py-2 text-center">Podcast not found!</p>
			<a href={resolve('/')} class="underline">Go back Home?</a>
		{/if}
	{/if}
</article>

<style lang="scss">
	@use '../../../styles//text.scss';

	.podcast-title {
		@include text.textOverflowEllipses2Lines;
	}
</style>
