<script lang="ts">
	import defaultImage from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import PodcastAudioButtons from '#lib/podcast/components/podcast-detail/PodcastAudioButtons.svelte';
	import PodcastProgressBar from '#lib/podcast/components/podcast-detail/PodcastProgressBar.svelte';
	import PodcastEpisodeTranscription from '#lib/podcast/components/PodcastEpisodeTranscription.svelte';
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

	let episodeStarted = $derived(podcastState.episodeStarted);

	let loadingPodcast = $derived(podcastState.loadingPodcast);

	let errorLoadingEpisode: string | null = $state(null);

	let transcriptionRequest = $derived(
		podcastState.episodeTranscriptionRequestMap.get(episode?.url || '') || null
	);

	$effect(() => {
		if (!podcast) {
			untrack(() => {
				PodcastService.loadPodcast(podcastId);
			});
		} else if (!episode) {
			errorLoadingEpisode = null;

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

<article class="flex h-full flex-col items-center gap-2 px-6 py-6 text-center text-text">
	<div class="flex h-4/12 min-h-4/12 w-full flex-col items-center gap-2">
		<img
			src={podcast?.imageUrl || defaultImage}
			alt="Podcast cover"
			class="h-6/12 min-h-6/12 rounded-full"
		/>

		<a href={resolve('/podcasts/[id]', { id: podcast?.id || '1' })}>
			<h2 class="text-lg font-semibold underline">{podcast?.name}</h2>
		</a>
		<h3>{episode?.title}</h3>
	</div>

	{#if loadingPodcast}
		<LoadingIndicator />
	{:else}
		<div class="flex h-8/12 w-full flex-col gap-2">
			{#if podcast}
				<div class="flex h-4/12 flex-col gap-4">
					<PodcastAudioButtons
						{podcast}
						episodeView={true}
						disableButtons={!!errorLoadingEpisode}
					/>

					<PodcastProgressBar disableButtons={!!errorLoadingEpisode} />

					{#if errorLoadingEpisode}
						<p>{errorLoadingEpisode}</p>
					{/if}
				</div>

				{#if episode}
					<div class="relative h-8/12 w-full">
						{#if episodeStarted}
							<PodcastEpisodeTranscription
								duration={episode?.duration}
								{episode}
								percentageComplete={transcriptionRequest?.percentageComplete}
								status={transcriptionRequest?.status}
								episodeView={true}
							/>
						{/if}
					</div>
				{/if}
			{:else}
				{#if errorLoadingEpisode}
					<div class="mt-4 flex flex-col gap-4">
						<p>{errorLoadingEpisode}</p>
						<a href={resolve('/')} class="underline">Go Home</a>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</article>

<style lang="scss">
	@use '../../../../../lib/styles/text.scss';

	h2 {
		@include text.textOverflowEllipses1Line;
	}

	h3 {
		@include text.textOverflowEllipses3Lines;
	}
</style>
