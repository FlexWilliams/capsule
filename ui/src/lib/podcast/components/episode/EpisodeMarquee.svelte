<script lang="ts">
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { resolve } from '$app/paths';

	let podcast = $derived(podcastState.selectedPodcast);
	let episode = $derived(podcastState.episode);
</script>

<a
	href={resolve('/podcasts/[id]/episode/[episodeId]', {
		id: podcast?.id || '',
		episodeId: episode?.guid || ''
	})}
>
	<section role="marquee" class="flex h-full w-11/12 items-center gap-2">
		{#if podcast}
			<img src={podcast.imageUrl} alt="Podcast cover" class="h-10/12 rounded-full" />

			<div class="marquee flex w-full max-w-12/12 gap-12 overflow-x-hidden">
				<div class="marquee-track">
					<h3 class="marquee-text text-text">{podcast.name} - {episode?.title}</h3>
				</div>
				<div class="marquee-track" aria-hidden="true">
					<h3 class="marquee-text text-text">{podcast.name} - {episode?.title}</h3>
				</div>
			</div>
		{/if}
	</section>
</a>

<style lang="scss">
	@use '../../../styles//text.scss';

	.marquee-text {
		@include text.textOverflowEllipses1Line;
	}

	.marquee-track {
		display: flex;
		align-items: center;
		flex: 0 0 auto;
		animation-name: marquee;
		animation-duration: 8s;
		animation-timing-function: linear;
		animation-delay: 0s;
		animation-iteration-count: infinite;
		animation-play-state: running;
		animation-direction: normal;
	}

	/* Optional: Pause when the user hovers */
	.marquee:hover .marquee-track {
		animation-play-state: paused;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-110%);
		}
	}

	/* Accessibility: Stop animation for users sensitive to motion */
	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}
</style>
