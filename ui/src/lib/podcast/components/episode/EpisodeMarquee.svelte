<script lang="ts">
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { resolve } from '$app/paths';

	let podcast = $derived(podcastState.selectedPodcast);
	let episode = $derived(podcastState.episode);
</script>

<section role="marquee" class="relative h-full w-11/12">
	{#if podcast && episode}
		<a
			class=" relative z-2 flex h-full w-full items-center gap-2"
			href={resolve('/podcasts/[id]/episode/[episodeId]', {
				id: podcast?.id || '1',
				episodeId: episode?.guid || '1'
			})}
		>
			<img src={podcast.imageUrl} alt="Podcast cover" class="h-10/12 rounded-full" />

			<div class="marquee flex w-full max-w-12/12 gap-12 overflow-x-hidden">
				<div class="marquee-track">
					<h3 class="marquee-text text-text">{podcast.name} - {episode?.title}</h3>
				</div>
				<div class="marquee-track" aria-hidden="true">
					<h3 class="marquee-text text-text">{podcast.name} - {episode?.title}</h3>
				</div>
			</div>
		</a>
	{/if}
</section>

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
		animation-duration: 12s;
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
			// 100% + 10% for the gap/padding (magic number, not perfect)
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
