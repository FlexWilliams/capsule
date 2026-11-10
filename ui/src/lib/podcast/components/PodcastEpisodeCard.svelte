<script lang="ts">
	import spin from '#lib/assets/icons/at-icons--arrows-clockwise.svg';
	import checkmark from '#lib/assets/icons/at-icons--checkmark.svg';
	import close from '#lib/assets/icons/at-icons--cross.svg';
	import info from '#lib/assets/icons/at-icons--info.svg';
	import text from '#lib/assets/icons/at-icons--text.svg';
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import {
		TranscriptionStatus,
		type TranscriptionRequest
	} from '#lib/transcription/transcription.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { WebSocketService } from '#lib/web-socket/web-socket-service.svelte.ts';
	import type { PodcastEpisode } from '../model/podcast';
	import { PodcastService } from '../service/podcast.service.svelte';
	import {
		podcastState,
		podcastState$$addEpisodeTranscriptionRequest,
		podcastState$$setShowEpisodeTranscription,
		podcastState$$toggleShowEpisodeTranscription
	} from '../state/podcast.state.svelte';
	import PodcastEpisodeTranscription from './PodcastEpisodeTranscription.svelte';

	interface PodcastEpisodeCardProps {
		episode: PodcastEpisode;
	}

	let { episode }: PodcastEpisodeCardProps = $props();

	let transcriptionRequest = $derived(
		podcastState.episodeTranscriptionRequestMap.get(episode?.url || '') || null
	);

	let showTranscription = $derived(
		podcastState.showEpisodeTranscriptionMap.get(episode?.url || '') || false
	);

	let isSelectedPodcast = $derived(podcastState.selectedPodcastUrl === episode?.url);

	let isPlaying = $derived(audioState.isPlaying);

	let summaryOpen = $state(false);

	let pubDate = $derived(
		`${new Date(episode?.publishDate || new Date().getTime()).toLocaleDateString()}`
	);

	function handlePlayButtonClick(episodeUrl?: string, directUrl?: string): void {
		VibrationService.vibrate();

		if (!episodeUrl) {
			return;
		}

		if (isPlaying && isSelectedPodcast) {
			AudioService.pause();
		} else {
			PodcastService.setSelectedPodcastDirectUrl(directUrl || null);
			PodcastService.setSelectedPodcastUrl(episodeUrl);

			AudioService.play();
		}
	}

	function handleTranscriptionPlayButtonClick(): void {
		handlePlayButtonClick(episode?.url, episode?.directUrl);
	}

	function handleCloseEpisodeTranscription(): void {
		VibrationService.vibrate();

		const podcastUrl = episode?.url;

		if (!podcastUrl) {
			return;
		}

		podcastState$$setShowEpisodeTranscription(podcastUrl, false);
	}

	function handleTranscriptionClick(): void {
		VibrationService.vibrate();

		const podcastUrl = episode?.url;

		if (!podcastUrl) {
			return;
		}

		podcastState$$toggleShowEpisodeTranscription(podcastUrl);

		if (podcastState.episodeTranscriptionRequestMap.has(podcastUrl)) {
			return;
		}

		podcastState$$addEpisodeTranscriptionRequest(podcastUrl);

		const msg: TranscriptionRequest = {
			podcastUrl
		};

		WebSocketService.sendMessage(msg);
	}
</script>

<article
	class="relative mb-6 h-full overflow-hidden rounded-sm bg-card p-4 text-card-text shadow-md"
>
	<header class="mt-6 h-7/12 max-h-7/12">
		<h3 class="flex-1">
			{episode?.title}
		</h3>
	</header>

	{#if transcriptionRequest?.status === TranscriptionStatus.Failed}
		<p class="absolute top-4 right-22 text-sm text-red-400">Error occurred, please try again</p>
	{/if}
	<button
		class="absolute top-4 right-14 z-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-episode-transcribe-button p-1 shadow-md disabled:cursor-not-allowed disabled:bg-episode-transcribe-button-disabled"
		aria-label="Transcribe podcast"
		onclick={handleTranscriptionClick}
	>
		{#if transcriptionRequest?.status === TranscriptionStatus.Processing}
			<img src={spin} alt="Loading icon" class="spin h-9/12 w-9/12" />
		{:else if transcriptionRequest?.status === TranscriptionStatus.Finished}
			<img src={checkmark} alt="Finished loading icon" class="h-9/12 w-9/12" />
		{:else}
			<img src={text} alt="Text icon" class="h-9/12 w-9/12" />
		{/if}
	</button>

	<details class="absolute top-4 right-4 flex w-full flex-col">
		<summary
			class="h-6 w-6"
			onclick={() => {
				summaryOpen = !summaryOpen;
			}}
		>
			{#if summaryOpen}
				<img src={close} alt="Close Icon" class="h-full w-full" />
			{:else}
				<img src={info} alt="Info Icon" class="h-full w-full" />
			{/if}
		</summary>
		<dl>
			<div class="summary">
				<dt>Summary:</dt>
				<dd>{episode?.summary}</dd>
			</div>
			<div>
				<dt>Duration:</dt>
				<dd>{episode?.duration}sec</dd>
			</div>
			<div>
				<dt>Size:</dt>
				<dd>{episode?.contentLengthInMb}Mb</dd>
			</div>
			<div>
				<dt>URL:</dt>
				<dd>{episode?.url}Mb</dd>
			</div>
		</dl>
	</details>

	{#if showTranscription}
		<PodcastEpisodeTranscription
			duration={episode?.duration}
			{handleTranscriptionPlayButtonClick}
			{handleCloseEpisodeTranscription}
			{isPlaying}
			{isSelectedPodcast}
			percentageComplete={transcriptionRequest?.percentageComplete}
			status={transcriptionRequest?.status}
		/>
	{/if}

	<footer class="flex h-2/12 max-h-2/12 items-center justify-between">
		<p class="text-sm">{pubDate}</p>
		<button
			class="w-20 cursor-pointer rounded-sm bg-episode-play-button py-1 shadow-md"
			onclick={() => handlePlayButtonClick(episode?.url, episode?.directUrl)}
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

<style lang="scss">
	@use '../../styles/animations.scss';

	article {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		justify-content: space-between;
		position: relative;

		header {
			overflow: hidden;
		}

		footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		summary::marker,
		summary::-webkit-details-marker {
			display: none;
			content: '';
		}

		details {
			&:open {
				position: absolute;
				top: 0;
				background: white;
				padding: 1rem;
				left: 0;
				width: 100%;
				height: 100%;
				max-height: 100%;
				overflow: hidden;
			}

			summary {
				cursor: pointer;
				align-self: end;
			}

			dl {
				padding: 1rem;
				/**
					// Unsure why percentage won't work here...
					height: 80%;
					max-height: 80%;
				*/

				height: 6rem;
				max-height: 6rem;

				overflow: auto;

				dt {
					text-decoration: underline;
					background-color: yellow;
					padding: 0.25rem 0;
					display: flex;
					align-items: center;
				}

				div {
					display: flex;
					justify-content: space-between;
				}

				div.summary {
					flex-direction: column;
				}
			}
		}
	}

	.spin {
		@include animations.spin;
	}
</style>
