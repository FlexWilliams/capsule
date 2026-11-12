<script lang="ts">
	import spin from '#lib/assets/icons/at-icons--arrows-clockwise.svg';
	import checkmark from '#lib/assets/icons/at-icons--checkmark.svg';
	import { SPEECH_TO_TEXT_API_URL } from '$app/env/public';

	import arrowDown from '#lib/assets/icons/at-icons--cloud-arrow-down.svg';
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
		podcastState$$setListeningEpisode,
		podcastState$$setShowEpisodeTranscription,
		podcastState$$toggleShowEpisodeTranscription
	} from '../state/podcast.state.svelte';
	import PodcastEpisodeTranscription from './PodcastEpisodeTranscription.svelte';
	import PodcastEpisodeCardAudioButton from './podcast-detail/PodcastEpisodeCardAudioButton.svelte';

	interface PodcastEpisodeCardProps {
		podcastTitle: string;
		episode: PodcastEpisode;
	}

	let { podcastTitle, episode }: PodcastEpisodeCardProps = $props();

	let transcriptionRequest = $derived(
		podcastState.episodeTranscriptionRequestMap.get(episode?.url || '') || null
	);

	let showTranscription = $derived(
		podcastState.showEpisodeTranscriptionMap.get(episode?.url || '') || false
	);

	let isSelectedPodcast = $derived(podcastState.selectedPodcastUrl === episode?.url);

	let isPlaying = $derived(audioState.isPlaying);

	let summaryOpen = $state(false);

	let downloading = $state(false);

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
			podcastState$$setListeningEpisode(episode);
			PodcastService.setSelectedPodcastDirectUrl(directUrl || null);
			PodcastService.setSelectedPodcastUrl(episodeUrl);

			AudioService.play();
		}
	}

	async function handleDownloadPlayButtonClick(
		episodeUrl?: string,
		directUrl?: string
	): Promise<void> {
		VibrationService.vibrate();

		if (!episodeUrl) {
			return;
		}

		downloading = true;

		let downloadUrl = episodeUrl;

		try {
			if (directUrl) {
				downloadUrl = directUrl;
			} else if (episodeUrl) {
				const response = await fetch(`${SPEECH_TO_TEXT_API_URL}/via-url`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						url: episodeUrl,
						noTranscribe: true
					})
				});

				if (!response.ok) {
					console.error(`Error loading podcast via url, defaulting to original url.`);
				} else {
					downloadUrl = await response.text();
				}
			}
		} catch {
			console.error(`Error downloading podcast via api. Trying `);
		} finally {
			// TODO: inner try/catch here...
			const title = `${podcastTitle} - ${episode.title}`;

			const data = await fetch(downloadUrl);

			const blob = await data.blob();

			const file = new Blob([blob], { type: 'audio/mpeg' });

			const a = document.createElement('a');

			a.href = URL.createObjectURL(file);

			a.download = `${title}.mp3`;

			a.click();

			downloading = false;
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
	class="relative mb-6 h-40 overflow-hidden rounded-sm bg-card p-4 text-card-text shadow-md"
	class:h-55={showTranscription}
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
			class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-episode-transcribe-close-button p-1"
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
				<dd>{episode?.summary || '(none)'}</dd>
			</div>
			<div>
				<dt>Duration:</dt>
				<dd>{Math.floor((episode?.duration || 0) / 60)}min</dd>
			</div>
			<div>
				<dt>Size:</dt>
				<dd>{episode?.contentLengthInMb}Mb</dd>
			</div>
			<div>
				<dt>Original URL:</dt>
				<dd>
					{#if episode?.url}
						<a href={episode.url} target="_blank" rel="external" class="font-semibold underline"
							>Link</a
						>
					{:else}
						<p>No Link Available</p>
					{/if}
				</dd>
			</div>
		</dl>
	</details>

	{#if showTranscription}
		<PodcastEpisodeTranscription
			duration={episode?.duration}
			{handleCloseEpisodeTranscription}
			{episode}
			percentageComplete={transcriptionRequest?.percentageComplete}
			status={transcriptionRequest?.status}
		/>
	{/if}

	<footer class="flex h-2/12 max-h-2/12 items-center justify-between">
		<p class="text-sm">{pubDate}</p>
		<div class="flex h-6 max-h-6 items-center gap-4">
			<button
				aria-label={`Download episode "${episode?.title}"`}
				class="flex h-6 w-6 items-center justify-center"
				disabled={downloading}
				onclick={() => handleDownloadPlayButtonClick(episode?.url, episode?.directUrl)}
			>
				{#if downloading}
					<img src={spin} alt="Loading icon" class="spin" />
				{:else}
					<img src={arrowDown} alt="Save icon" />
				{/if}
			</button>

			<PodcastEpisodeCardAudioButton {episode} />
		</div>
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
				background: var(--color-card);
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
				padding: 0 1rem;
				height: 6rem;
				max-height: 6rem;

				overflow: auto;

				dt {
					text-decoration: underline;
					padding: 0.25rem 0;
					display: flex;
					align-items: center;
				}

				div {
					display: flex;
					justify-content: space-between;
					align-items: center;

					&:first-of-type {
						align-items: flex-start;
					}
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
