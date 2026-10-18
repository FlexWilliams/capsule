<script lang="ts">
	import type { PodcastEpisode } from '../model/podcast';

	interface PodcastEpisodeCardProps {
		episode: PodcastEpisode;
	}

	let { episode }: PodcastEpisodeCardProps = $props();

	let pubDate = $derived(
		`${new Date(episode?.publishDate || new Date().getTime()).toLocaleDateString()} ${new Date(episode?.publishDate || new Date().getTime()).toLocaleTimeString()}`
	);
</script>

<article class="mb-6 h-full overflow-hidden rounded-sm p-4 shadow-md">
	<header>
		<h3 class="flex-1">
			{episode?.title}
		</h3>
	</header>

	<footer>
		<p class="text-sm">{pubDate}</p>
		<button class="w-20 rounded-sm bg-slate-400 py-1 shadow-md">Play</button>
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

			button {
			}
		}
	}
</style>
