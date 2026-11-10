<script lang="ts">
	import close from '#lib/assets/icons/at-icons--cross.svg';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import { TranscriptionStatus } from '#lib/transcription/transcription.ts';
	import PodcastProgressBar from './podcast-detail/PodcastProgressBar.svelte';

	interface PodcastEpisodeTranscriptionProps {
		duration?: number;
		percentageComplete?: number;
		status?: TranscriptionStatus;
		isSelectedPodcast: boolean;
		isPlaying: boolean;
		handleTranscriptionPlayButtonClick: () => void;
		handleCloseEpisodeTranscription: () => void;
	}

	let {
		duration,
		percentageComplete,
		status,
		isSelectedPodcast,
		isPlaying,
		handleTranscriptionPlayButtonClick,
		handleCloseEpisodeTranscription
	}: PodcastEpisodeTranscriptionProps = $props();

	let currentCueText = $derived(audioState.currentCueText);
</script>

<article class="absolute top-0 left-0 z-5 flex h-full w-full flex-col justify-between bg-white p-4">
	<button
		class="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amber-200 p-1"
		aria-label="Close Transcription Panel"
		onclick={handleCloseEpisodeTranscription}
	>
		<img src={close} alt="Close Icon" class="h-full w-full" />
	</button>

	<header class="flex justify-between">
		<h3>Podcast transcription:</h3>
		<div class="flex flex-1 items-center">
			{#if status === TranscriptionStatus.Finished}
				<div class="flex w-full justify-center">
					<div class="h-2 w-2 rounded-full bg-green-300"></div>
				</div>
			{:else if status === TranscriptionStatus.Processing}
				<div class="flex w-full items-center justify-center pr-4">
					<span class="mr-1 text-xs">{percentageComplete || 0}%</span>
					<div class="h-2 w-2 rounded-full bg-red-200"></div>
				</div>
			{:else if status === TranscriptionStatus.Failed}
				<div class="h-2 w-2 rounded-full bg-red-500"></div>
			{/if}
		</div>
	</header>

	<div
		class="my-0.5 flex flex-1 items-center justify-center rounded-md bg-episode-transcription-text-bg p-0.5 text-center font-bold"
	>
		{#if currentCueText}
			<p class="text-episode-transcription-text">“{currentCueText}”</p>
		{:else}
			<p class="text-episode-transcription-text">...</p>
		{/if}
	</div>

	<footer class="flex w-full items-center justify-between">
		<div class="flex h-full w-7/12 items-center md:w-9/12">
			<PodcastProgressBar explicitDuration={duration} showProgressBarTimeStamps={true} />
		</div>

		<button
			class="w-20 cursor-pointer rounded-sm bg-episode-play-button py-1 shadow-md"
			onclick={handleTranscriptionPlayButtonClick}
		>
			{#if isSelectedPodcast}
				{#if isPlaying}
					<span>Playing</span>
				{:else}
					<span>Paused</span>
				{/if}
			{:else}
				<span>Play</span>
			{/if}
		</button>
	</footer>
</article>
