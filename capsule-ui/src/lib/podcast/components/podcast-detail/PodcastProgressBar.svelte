<script lang="ts">
	import { AudioService } from '#lib/audio/service/audio.service.svelte.ts';
	import { audioState } from '#lib/audio/state/audio.state.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';

	const progressBarId = 'progress-bar';

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	let currentTime = $derived(audioState.currentTime);

	let duration = $derived(audioState.duration);

	let easingProgress = $state(false);

	let easingValue = $state(0);

	let easingBoundValue = $state(0);

	let progressBarValue = $derived(easingProgress ? easingValue : currentTime);

	function getProgressBar(): HTMLProgressElement | null {
		return document.getElementById(progressBarId) as HTMLProgressElement;
	}

	function easeProgressBarValue(): void {
		easingValue = currentTime;

		easingProgress = true;

		const progressBar = getProgressBar();

		if (!progressBar) {
			easingValue = 0;
			easingProgress = false;

			return;
		}

		if (!currentTime) {
			easingValue = 0;
			easingProgress = false;

			return;
		}

		let speed = 10;
		const iteration = 1 * 20; // 50ms

		const interval = setInterval(() => {
			if (speed < 1000) {
				speed *= 1.15;
			}

			if (easingValue > easingBoundValue) {
				// decrement
				easingValue =
					easingValue - speed <= easingBoundValue ? easingBoundValue : easingValue - speed;

				if (easingValue <= easingBoundValue) {
					easingProgress = false;
					clearInterval(interval);
				}
			} else if (easingValue < easingBoundValue) {
				// increment
				easingValue =
					easingValue + speed >= easingBoundValue ? easingBoundValue : easingValue + speed;

				if (easingValue >= easingBoundValue) {
					easingProgress = false;
					clearInterval(interval);
				}
			}
		}, iteration);
	}

	function handleProgressBarClick(e: MouseEvent): void {
		VibrationService.vibrate();

		const totalWidth = (e.target as HTMLButtonElement)?.clientWidth;

		const percentage = Math.fround(e.offsetX / totalWidth);

		const seekTo = Math.floor(duration * percentage);

		easingBoundValue = seekTo;

		easeProgressBarValue();

		console.log(`Seeking to: ${percentage}% ~= ${seekTo}`);

		AudioService.seekTo(seekTo);
	}

	function formatTime(timeInSeconds: number): string {
		timeInSeconds = Math.floor(timeInSeconds);

		const seconds = timeInSeconds % 60;
		const minutes = Math.floor(timeInSeconds / 60) % 60;
		const hours = Math.floor(timeInSeconds / 60 / 60);

		const secondsStr = seconds > 10 ? seconds : `0${seconds}`;
		const minutesStr = minutes > 10 ? minutes : `0${minutes}`;
		const hoursStr = hours > 10 ? hours : `0${hours}`;

		return `${hoursStr}:${minutesStr}:${secondsStr}`;
	}
</script>

<div class="progress-bar w-full">
	<div class="progress-wrapper relative flex">
		<progress
			id={progressBarId}
			max={duration}
			value={progressBarValue}
			class="w-full rounded-md bg-audio-button"
		></progress>
		<button class="absolute h-full w-full" aria-label="Seek to" onclick={handleProgressBarClick}
		></button>
	</div>

	<label for="progress-bar" class="flex min-h-8 items-center justify-between">
		{#if selectedPodcastUrl}
			<span class="text-xs text-text">{formatTime(currentTime)}</span>
			<span class="text-xs text-text">{formatTime(duration)}</span>
		{/if}
	</label>
</div>

<style lang="scss">
	div.progress-wrapper {
		width: 100%;
		height: 8px;
		border-radius: 16px;
	}

	@mixin progressbar {
		width: 100%;
		height: 8px;
		border-radius: 16px;
		cursor: pointer;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-color: var(--progress-bar-bg);
	}

	// See: https://stackoverflow.com/a/34798353
	progress {
		@include progressbar;
	}

	progress::-webkit-progress-bar {
		@include progressbar;
	}

	progress::-webkit-progress-value {
		@include progressbar;
		background-color: var(--progress-bar);
	}

	progress::-moz-progress-bar {
		@include progressbar;
	}
</style>
