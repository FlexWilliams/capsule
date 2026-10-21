<script lang="ts">
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Podcast } from '../model/podcast';

	interface PodcastViaRssCardProps {
		podcast: Podcast;
	}

	let { podcast }: PodcastViaRssCardProps = $props();

	function goToPodcast(id: string): void {
		VibrationService.vibrate();

		goto(resolve(`/podcasts/[id]?viaRss=true`, { id: id || 'EMPTY' }));
	}
</script>

<p class="relative z-1 w-fit">{podcast?.name}</p>
<img
	src={podcast?.imageUrl}
	alt={`Podcast cover for ${podcast?.name}`}
	class="absolute top-2/5 left-4 z-1 h-8/12 max-h-15 max-w-15 rounded-md"
/>
<a
	href={resolve(`/podcasts/[id]?viaRss=true`, { id: podcast?.id || 'EMPTY' })}
	class="absolute top-1/2 right-4 z-1 h-8/12 max-h-8/12 underline">Listen</a
>
<button
	aria-label="Go to podcast"
	class="absolute top-0 left-0 h-full w-full cursor-pointer"
	onclick={() => goToPodcast(podcast?.id)}
></button>
