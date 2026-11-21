<script lang="ts">
	import defaultImage from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import PodcastAudioButtons from '#lib/podcast/components/podcast-detail/PodcastAudioButtons.svelte';
	import PodcastProgressBar from '#lib/podcast/components/podcast-detail/PodcastProgressBar.svelte';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import {
		podcastState,
		podcastState$$setListeningEpisode
	} from '#lib/podcast/state/podcast.state.svelte.ts';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { untrack } from 'svelte';

	let podcastId = $derived(page.params.id || '');

	let episodeId = $derived(page.params.episodeId || '');

	let podcast = $derived(podcastState.selectedPodcast);

	let episode = $derived(podcastState.episode);

	let loadingPodcast = $derived(podcastState.loadingPodcast);

	let errorLoadingEpisode: string | null = $state(null);

	$effect(() => {
		if (!podcast) {
			untrack(() => {
				PodcastService.loadPodcast(podcastId);
			});
		} else if (!episode) {
			untrack(() => {
				const ep = podcast?.episodes?.find((e) => e.guid === episodeId);
				if (ep) {
					podcastState$$setListeningEpisode(ep);
				} else {
					errorLoadingEpisode = `Unable to find episode`;
				}
			});
		}
	});

	$effect(() => {
		if (!loadingPodcast && !podcast) {
			untrack(() => {
				errorLoadingEpisode = `Unable to find episode (podcast not found)`;
			});
		}
	});
</script>

<article class="flex flex-col items-center px-10 py-12 text-center text-text">
	<img
		src={podcast?.imageUrl || defaultImage}
		alt="Podcast cover"
		class="h-8/12 w-8/12 rounded-full"
	/>

	<a href={resolve('/podcasts/[id]', { id: podcast?.id || '1' })}>
		<h2 class="unterline text-lg font-semibold">{podcast?.name}</h2>
	</a>
	<h3>{episode?.title}</h3>

	{#if loadingPodcast}
		<LoadingIndicator />
	{:else}
		{#if podcast}
			<div class="flex w-full flex-col gap-4">
				<PodcastAudioButtons {podcast} episodeView={true} disableButtons={!!errorLoadingEpisode} />

				<PodcastProgressBar disableButtons={!!errorLoadingEpisode} />

				{#if errorLoadingEpisode}
					<p>{errorLoadingEpisode}</p>
				{/if}
			</div>
		{:else}
			{#if errorLoadingEpisode}
				<div class="mt-4 flex flex-col gap-4">
					<p>{errorLoadingEpisode}</p>
					<a href={resolve('/')} class="underline">Go Home</a>
				</div>
			{/if}
		{/if}
	{/if}
</article>
