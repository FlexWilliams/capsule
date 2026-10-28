<script lang="ts">
	import spin from '#lib/assets/icons/at-icons--arrows-clockwise.svg';
	import fastForward from '#lib/assets/icons/at-icons--fast-forward.svg';
	import next from '#lib/assets/icons/at-icons--next.svg';
	import pause from '#lib/assets/icons/at-icons--pause.svg';
	import play from '#lib/assets/icons/at-icons--play.svg';
	import previous from '#lib/assets/icons/at-icons--previous.svg';
	import rewind from '#lib/assets/icons/at-icons--rewind.svg';
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import type { Podcast } from '#lib/podcast/model/podcast.ts';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';

	interface PodcastAudioButtons {
		podcast: Podcast;
	}

	let { podcast }: PodcastAudioButtons = $props();

	let isPlaying = $derived(audioState.isPlaying);

	let podcastLoading = $derived(audioState.loading);

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	function handlePreviousButtonClick(): void {
		VibrationService.vibrate();

		AudioService.previous();
	}

	function handleRewindButtonClick(): void {
		VibrationService.vibrate();

		AudioService.rewind();
	}

	function handlePauseButtonClick(): void {
		VibrationService.vibrate();

		AudioService.pause();
	}

	function handlePlayButtonClick(): void {
		VibrationService.vibrate();

		if (!selectedPodcastUrl) {
			const episode = podcast?.episodes ? podcast.episodes[0] : undefined;
			if (!episode || !episode?.url) {
				return;
			}

			PodcastService.setSelectedPodcastUrl(episode.url);
		}

		AudioService.play();
	}

	function handleFastForwardButtonClick(): void {
		VibrationService.vibrate();

		AudioService.fastForward();
	}

	function handleNextButtonClick(): void {
		VibrationService.vibrate();

		AudioService.next();
	}
</script>

<div class="audio-buttons flex items-center justify-center">
	<button
		class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
		aria-label="Previous episode"
		onclick={handlePreviousButtonClick}
		disabled={!podcast?.episodes}><img src={previous} alt="Previous icon" /></button
	>
	<button
		class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
		aria-label="Rewind audio"
		onclick={handleRewindButtonClick}
		disabled={!podcast?.episodes}><img src={rewind} alt="Rewind icon" /></button
	>

	<!-- TODO: make into button group for better a11y -->
	<!-- TODO: also make the space bar toggle these buttons -->
	{#if isPlaying}
		<button
			class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
			aria-label="Pause"
			onclick={handlePauseButtonClick}
			disabled={!podcast?.episodes}
		>
			{#if podcastLoading}
				<img src={spin} alt="Loading icon" class="spin" />
			{:else}
				<img src={pause} alt="Pause icon" />
			{/if}
		</button>
	{:else}
		<button
			class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
			aria-label="Play"
			onclick={handlePlayButtonClick}
			disabled={!podcast?.episodes}><img src={play} alt="Play icon" /></button
		>
	{/if}
	<button
		class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
		aria-label="Fast forward audio"
		onclick={handleFastForwardButtonClick}
		disabled={!podcast?.episodes}><img src={fastForward} alt="Fast forward icon" /></button
	>
	<button
		class="flex items-center justify-center rounded-4xl bg-audio-button p-2 shadow-md"
		aria-label="Next episode"
		onclick={handleNextButtonClick}
		disabled={!podcast?.episodes}><img src={next} alt="Next icon" /></button
	>
</div>

<style lang="scss">
	div.audio-buttons {
		gap: 1rem;

		button {
			min-height: 2.5rem;
			height: 2.5rem;
			min-width: 2.5rem;
			width: 2.5rem;

			&:nth-of-type(3) {
				min-height: 3.5rem;
				height: 3.5rem;
				min-width: 3.5rem;
				width: 3.5rem;

				img {
					width: 80%;
					height: 80%;
				}
			}

			img {
				width: 100%;
				height: 100%;
			}
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.spin {
		animation-name: spin;
		animation-duration: 5000ms;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}
</style>
