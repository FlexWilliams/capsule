<script lang="ts">
	import type { PodcastEpisode } from '#lib/podcast/model/podcast.ts';
	import PodcastEpisodeCard from '../PodcastEpisodeCard.svelte';

	interface PodcastEpisodeListProps {
		episodes?: PodcastEpisode[];
	}

	let { episodes }: PodcastEpisodeListProps = $props();
</script>

<ul class="max-w-full flex-1 overflow-auto sm:flex-2">
	{#each episodes as episode (episode?.guid)}
		<li class="mb-4 h-40 rounded-md bg-slate-100">
			<PodcastEpisodeCard {episode} />
		</li>
	{:else}
		<li>
			<p>No episodes</p>
		</li>
	{/each}
</ul>
