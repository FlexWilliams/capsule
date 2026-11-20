<script lang="ts">
	import defaultImage from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import PodcastAudioButtons from '#lib/podcast/components/podcast-detail/PodcastAudioButtons.svelte';
	import PodcastProgressBar from '#lib/podcast/components/podcast-detail/PodcastProgressBar.svelte';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { resolve } from '$app/paths';

	let podcast = $derived(podcastState.selectedPodcast);
	let episode = $derived(podcastState.episode);
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

	{#if podcast}
		<div class="flex w-full flex-col gap-4">
			<PodcastAudioButtons {podcast} episodeView={true} />

			<PodcastProgressBar />
		</div>
	{/if}
</article>
