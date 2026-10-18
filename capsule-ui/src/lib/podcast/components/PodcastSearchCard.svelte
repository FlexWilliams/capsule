<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Podcast } from '../model/podcast';

	interface PodcastSearchCardProps {
		podcast: Podcast;
	}

	let { podcast }: PodcastSearchCardProps = $props();

	function handlePodcastButtonClick(): void {
		// TODO: add vibration here
		goto(resolve(`/podcasts/[id]`, { id: podcast?.id }));
	}
</script>

<article class="overflow-hidden rounded-sm shadow-md">
	<h3 class="flex-1 px-4">
		{podcast?.name}
	</h3>

	<img class="h-full" src={podcast?.imageUrl} alt={`Podcast cover for "${podcast?.name}"`} />

	<button
		class="absolute top-0 left-0 h-full w-full"
		aria-label={`Go to "${podcast?.name}"`}
		onclick={handlePodcastButtonClick}
	></button>
</article>

<style lang="scss">
	article {
		height: 4rem;
		max-height: 4rem;
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-end;
		align-items: center;
		position: relative;
	}
</style>
