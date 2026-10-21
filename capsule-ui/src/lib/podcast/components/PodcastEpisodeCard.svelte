<script lang="ts">
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

	let pubDate = $derived(
		`${new Date(episode?.publishDate || new Date().getTime()).toLocaleDateString()} ${new Date(episode?.publishDate || new Date().getTime()).toLocaleTimeString()}`
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

<article class="relative mb-6 h-full overflow-hidden rounded-sm p-4 shadow-md">
	<header>
		<h3 class="flex-1">
			{episode?.title}
		</h3>
	</header>

	<details>
		<summary>Details</summary>
		<dl>
			<div class="summary">
				<dt>Summary:</dt>
				<dd>{episode?.summary}</dd>
			</div>
			<div>
				<dt>Size:</dt>
				<dd>{episode?.contentLengthInMb}Mb</dd>
			</div>
		</dl>
	</details>

	<footer>
		<p class="text-sm">{pubDate}</p>
		<button
			class="w-20 rounded-sm bg-slate-400 py-1 shadow-md"
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
			max-height: 50%;
			overflow: hidden;
		}

		footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
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
