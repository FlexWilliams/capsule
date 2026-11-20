<script lang="ts">
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';

	import defaultImage from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let favorites = $derived(podcastState.favorites);

	function handleGotoEpisodeClick(podcastId: string, episodeId: string): void {
		VibrationService.vibrate();

		if (!podcastId || !episodeId) {
			return;
		}

		goto(resolve(`/podcasts/[id]/episode/[episodeId]`, { id: podcastId, episodeId }));
	}
</script>

<ul class="h-full p-4">
	<!-- TODO: show loading indicator-->
	{#each favorites as fav (`${fav.podcastId}-${fav.episodeId}`)}
		<li class="relative mb-4 flex h-35 flex-col rounded-md bg-card p-4 shadow-md">
			<!-- TODO: make into component -->
			<article class="relative flex h-full w-full flex-col">
				<div class="flex h-10/12 w-full items-center gap-4">
					<img
						src={fav?.imageUrl || defaultImage}
						alt={`Podcast cover for ${fav?.podcastTitle}`}
						class="max-h-8/12 max-w-8/12 rounded-md"
					/>
					<div class="flex w-11/12 flex-col items-start">
						<a
							href={resolve(`/podcasts/[id]`, { id: fav?.podcastId || 'EMPTY' })}
							class="underline"
						>
							<h3 class="w-fit max-w-full font-semibold">{fav?.podcastTitle}</h3></a
						>

						<h4 class="w-fit max-w-full">{fav?.episodeTitle}</h4>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<p>
						{fav?.publishDate
							? new Date(fav.publishDate).toLocaleDateString()
							: 'Unknown Publish Date'}
					</p>
					<a
						href={resolve(`/podcasts/[id]`, { id: fav?.podcastId || 'EMPTY' })}
						class="text-right underline">Listen</a
					>
				</div>
				<button
					aria-label="Go to episode"
					class="absolute top-0 left-0 h-full w-full cursor-pointer"
					onclick={() => handleGotoEpisodeClick(fav?.podcastId, fav?.episodeId)}
				></button>
			</article>
		</li>
	{:else}
		<li class="flex h-full w-full flex-col items-center justify-center">
			<p class="text-center">You don't have any favorites yet.</p>
		</li>
	{/each}
</ul>

<style lang="scss">
	@use '../../lib/styles/text.scss';

	h3,
	h4 {
		@include text.textOverflowEllipses2Lines;
	}
</style>
