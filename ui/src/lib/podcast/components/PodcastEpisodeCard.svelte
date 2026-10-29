<script lang="ts">
	import close from '#lib/assets/icons/at-icons--cross.svg';
	import info from '#lib/assets/icons/at-icons--info.svg';
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import type { PodcastEpisode } from '../model/podcast';
	import { PodcastService } from '../service/podcast.service.svelte';
	import { podcastState } from '../state/podcast.state.svelte';

	interface PodcastEpisodeCardProps {
		episode: PodcastEpisode;
	}

	let { episode }: PodcastEpisodeCardProps = $props();

	let isSelectedPodcast = $derived(podcastState.selectedPodcastUrl === episode?.url);

	let isPlaying = $derived(audioState.isPlaying);

	let summaryOpen = $state(false);

	let pubDate = $derived(
		`${new Date(episode?.publishDate || new Date().getTime()).toLocaleDateString()}`
	);

	function handlePlayButtonClick(episodeUrl?: string): void {
		VibrationService.vibrate();

		if (!episodeUrl) {
			return;
		}

		if (isPlaying && isSelectedPodcast) {
			AudioService.pause();
		} else {
			PodcastService.setSelectedPodcastUrl(episodeUrl);

			AudioService.play();
		}
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
		</dl>
	</details>

	<footer class="flex h-2/12 max-h-2/12 items-center justify-between">
		<p class="text-sm">{pubDate}</p>
		<button
			class="w-20 rounded-sm bg-episode-play-button py-1 shadow-md"
			onclick={() => handlePlayButtonClick(episode?.url)}
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
</style>
