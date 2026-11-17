<script lang="ts">
	import spin from '#lib/assets/icons/at-icons--arrows-clockwise.svg';
	import pause from '#lib/assets/icons/at-icons--pause.svg';
	import play from '#lib/assets/icons/at-icons--play.svg';
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import type { PodcastEpisode } from '#lib/podcast/model/podcast.ts';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import {
		podcastState,
		podcastState$$setListeningEpisode
	} from '#lib/podcast/state/podcast.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';

	interface PodcastEpisodeCardAudioButtonProps {
		episode: PodcastEpisode;
	}

	let { episode }: PodcastEpisodeCardAudioButtonProps = $props();

	let isSelectedPodcast = $derived(podcastState.selectedPodcastUrl === episode?.url);

	let isPlaying = $derived(audioState.isPlaying);

	let podcastLoading = $derived(audioState.loading);

	let isBuffering = $derived(audioState.isBuffering);

	function handlePlayButtonClick(episodeUrl?: string, directUrl?: string): void {
		VibrationService.vibrate();

		if (!episodeUrl) {
			return;
		}

		if (isPlaying && isSelectedPodcast) {
			AudioService.pause();
		} else {
			podcastState$$setListeningEpisode(episode);
			PodcastService.setSelectedPodcastDirectUrl(directUrl || null);
			PodcastService.setSelectedPodcastUrl(episodeUrl);

			AudioService.play();
		}
	}
</script>

<button
	class="flex h-8 w-20 cursor-pointer justify-center rounded-sm bg-episode-play-button py-2.5 shadow-md"
	onclick={() => handlePlayButtonClick(episode?.url, episode?.directUrl)}
	aria-label={isPlaying ? 'Pause episode' : 'Play episode'}
>
	{#if isSelectedPodcast}
		{#if isPlaying}
			{#if podcastLoading || isBuffering}
				<img src={spin} alt="Loading icon" class="spin" />
			{:else}
				<img src={pause} alt="Pause icon" />
			{/if}
		{:else}
			<img src={play} alt="Play icon" />
		{/if}
	{:else}
		<img src={play} alt="Play icon" />
	{/if}
</button>

<style lang="scss">
	@use '../../../styles/animations.scss';

	.spin {
		@include animations.spin;
	}
</style>
