<script lang="ts">
	import spin from '#lib/assets/icons/at-icons--arrows-clockwise.svg';
	import fastForward from '#lib/assets/icons/at-icons--fast-forward.svg';
	import next from '#lib/assets/icons/at-icons--next.svg';
	import pause from '#lib/assets/icons/at-icons--pause.svg';
	import play from '#lib/assets/icons/at-icons--play.svg';
	import previous from '#lib/assets/icons/at-icons--previous.svg';
	import rewind from '#lib/assets/icons/at-icons--rewind.svg';
	import mic from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import { audioState, audioState$$setIsPlaying } from '#lib/audio/state/audio.state.svelte.ts';
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { Podcast, PodcastRssMeta } from '../model/podcast';
	import { podcastState, podcastState$$setSelectedPodcastUrl } from '../state/podcast.state.svelte';
	import PodcastEpisodeCard from './PodcastEpisodeCard.svelte';

	let podcast: Podcast | null = $state(null);

	let loading = $state(true);

	let defaultCover = $state(mic);

	let isPlaying = $derived(audioState.isPlaying);

	let podcastLoading = $derived(audioState.loading);

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	async function fetchPodcastViaRss(podcastId: string): Promise<void> {
		// TODO: update to use localforage

		const existing = localStorage.getItem('rss-podcasts');
		if (!existing) {
			// TODO: display error
			loading = false;

			return;
		}

		const savedPodcasts = JSON.parse(existing) as PodcastRssMeta[];

		const found = savedPodcasts.find((s) => s.id === podcastId);
		if (!found) {
			// TODO: display error
			loading = false;

			return;
		}

		const { rssUrl } = found;

		try {
			const response = await fetch(`/api/rss`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ rssUrl })
			});

			if (!response.ok) {
				console.error(`Unable to fetch podcast with rssUrl: ${rssUrl}`);
			} else {
				podcast = (await response.json()) as Podcast;
			}
		} catch (e) {
			console.error(`Unable to fetch podcast with rssUrl: ${rssUrl}.\n${JSON.stringify(e)}`);
		} finally {
			loading = false;
		}
	}

	async function fetchPodcast(): Promise<void> {
		const podcastId = page.params.id;

		if (!podcastId) {
			console.error(`Unable to load podcast, no id provided!`);

			return;
		}

		const addViaRss = page.url.searchParams.get('viaRss') === 'true';
		if (addViaRss) {
			return fetchPodcastViaRss(podcastId);
		}

		try {
			const response = await fetch(`/api/podcasts/${podcastId || ''}`);

			if (!response.ok) {
				console.error(`Unable to fetch podcast with id: ${podcastId}`);
			} else {
				podcast = (await response.json()) as Podcast;
			}
		} catch (e) {
			console.error(`Unable to fetch podcast with id: ${podcastId}.\n${JSON.stringify(e)}`);
		} finally {
			loading = false;
		}
	}

	function handleImageLoadError(e: Event): void {
		const img = e.target as HTMLImageElement;
		img.src = defaultCover;
	}

	onMount(async () => {
		await fetchPodcast();
	});
</script>

<article class="flex h-full flex-col items-center gap-4 py-4">
	{#if loading}
		<LoadingIndicator />
	{:else}
		{#if podcast}
			<div class="flex flex-1 flex-col items-center justify-center gap-4">
				<h2 class="text-center text-xl">{podcast?.name || `Unknown Podcast`}</h2>

				<img
					src={podcast?.imageUrl || defaultCover}
					alt={`Podcast cover for "${podcast?.name}"`}
					class="podcast-cover rounded-md shadow-xl"
					onerror={handleImageLoadError}
				/>

				<div class="audio-buttons">
					<button
						class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
						aria-label="Previous episode"
						disabled={!podcast?.episodes}><img src={previous} alt="Previous icon" /></button
					>
					<button
						class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
						aria-label="Rewind audio"
						disabled={!podcast?.episodes}><img src={rewind} alt="Rewind icon" /></button
					>

					<!-- TODO: make into button group for better a11y -->
					<!-- TODO: also make the space bar toggle these buttons -->
					{#if isPlaying}
						<button
							class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
							aria-label="Pause"
							onclick={() => {
								audioState$$setIsPlaying(false);
							}}
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
							class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
							aria-label="Play"
							onclick={() => {
								if (!selectedPodcastUrl) {
									const episode = podcast?.episodes ? podcast.episodes[0] : undefined;
									if (!episode || !episode?.url) {
										return;
									}

									podcastState$$setSelectedPodcastUrl(episode.url);
								}
								audioState$$setIsPlaying(true);
							}}
							disabled={!podcast?.episodes}><img src={play} alt="Play icon" /></button
						>
					{/if}
					<button
						class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
						aria-label="Fast forward audio"
						disabled={!podcast?.episodes}><img src={fastForward} alt="Fast forward icon" /></button
					>
					<button
						class="flex items-center justify-center rounded-4xl bg-amber-400 p-2 shadow-md"
						aria-label="Next episode"
						disabled={!podcast?.episodes}><img src={next} alt="Next icon" /></button
					>
				</div>
			</div>

			<ul class="max-w-full flex-1 overflow-auto sm:flex-2">
				{#each podcast?.episodes as episode (episode?.guid)}
					<li class="mb-4 h-40 rounded-md bg-slate-100">
						<PodcastEpisodeCard {episode} />
					</li>
				{:else}
					<li>
						<p>No episodes</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-sm bg-amber-200 px-4 py-2 text-center">Podcast not found!</p>
			<a href={resolve('/')} class="underline">Go back Home?</a>
		{/if}
	{/if}
</article>

<style lang="scss">
	article {
		img.podcast-cover {
			min-height: 8rem;
			max-height: 8rem;
			min-width: 8rem;
			max-width: 8rem;
			border-radius: 8rem;
			margin: auto;
		}

		div.audio-buttons {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 1rem;

			button {
				min-height: 2rem;
				height: 2rem;
				min-width: 2rem;
				width: 2rem;
				display: flex;
				align-items: center;
				justify-content: center;

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
	}

	/**TODO: centralize animation */
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
