<script lang="ts">
	import speakerMute from '#lib/assets/icons/at-icons--speaker-mute.svg';
	import speaker from '#lib/assets/icons/at-icons--speaker.svg';
	import mic from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import PictureInPicture from '#lib/picture-in-picture/component/PictureInPicture.svelte';

	import type { Podcast } from '#lib/podcast/model/podcast.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';

	interface PodcastDetailHeaderProps {
		podcast: Podcast;
		canSubscribe?: boolean;
	}

	let { podcast, canSubscribe }: PodcastDetailHeaderProps = $props();

	let defaultCover = $state(mic);

	let muted = $derived(audioState.muted);

	function handleMuteButtonClick(): void {
		VibrationService.vibrate();

		if (muted) {
			AudioService.unmute();
		} else {
			AudioService.mute();
		}
	}

	function handleImageLoadError(e: Event): void {
		const img = e.target as HTMLImageElement;
		img.src = defaultCover;
	}
</script>

<h2 class="text-center text-xl text-text">{podcast?.name || `Unknown Podcast`}</h2>

<div class="relative flex w-full flex-1 items-center justify-between gap-4">
	<div class="flex-1"></div>
	<div class="flex h-full flex-1 flex-col gap-2">
		<div class="relative h-full w-full">
			<img
				src={podcast?.imageUrl || defaultCover}
				alt={`Podcast cover for "${podcast?.name}"`}
				class="cover rounded-md shadow-xl"
				onerror={handleImageLoadError}
			/>
		</div>

		<div class="flex h-10 max-h-10 w-full justify-center">
			<button
				class="w-full cursor-pointer rounded-full bg-subscribe-button p-2 text-sm text-button-text shadow-md disabled:text-button-text-disabled"
				disabled={!canSubscribe}>Subscribe</button
			>
		</div>
	</div>
	<div class="items-between flex h-full flex-1">
		<div class="flex flex-1 flex-col items-center justify-between">
			<div></div>
			<PictureInPicture />
			<button
				aria-label={muted ? 'Unmute?' : 'Mute?'}
				class="flex max-h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-mute-button shadow-md"
				onclick={handleMuteButtonClick}
			>
				<img
					class="h-1/2"
					src={muted ? speakerMute : speaker}
					alt={muted ? 'Muted Icon' : 'Speaker Icon'}
				/>
			</button>
		</div>
		<div class="flex-1"></div>
	</div>
</div>

<style lang="scss">
	img.cover {
		min-height: 8rem;
		max-height: 8rem;
		min-width: 8rem;
		max-width: 8rem;
		border-radius: 8rem;
		margin: auto;
	}
</style>
