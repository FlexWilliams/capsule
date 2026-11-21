<script lang="ts">
	import type { PodcastEpisode } from '#lib/podcast/model/podcast.ts';
	import PodcastEpisodeCard from '../PodcastEpisodeCard.svelte';

	interface PodcastEpisodeListProps {
		podcastId: string;
		podcastTitle: string;
		podcastImageUrl: string;
		episodes?: PodcastEpisode[];
	}

	let { podcastId, podcastTitle, podcastImageUrl, episodes }: PodcastEpisodeListProps = $props();
</script>

<ul class="w-full flex-1 overflow-auto sm:flex-2">
	{#each episodes as episode (episode?.guid)}
		<li class="mb-4 max-h-160 min-h-40 rounded-md px-2 text-text">
			<PodcastEpisodeCard {episode} {podcastId} {podcastTitle} {podcastImageUrl} />
		</li>
	{:else}
		<li>
			<p>No episodes</p>
		</li>
	{/each}
</ul>
