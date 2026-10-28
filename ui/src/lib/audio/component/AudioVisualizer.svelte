<script lang="ts">
	import { pictureInPictureState } from '#lib/picture-in-picture/state/picture-in-picture.state.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { onMount, untrack } from 'svelte';
	import {
		VISUALIZER_CANVAS_ID,
		VISUALIZER_VIDEO_ID,
		type VisualizerCanvasWorkerRequest
	} from '../audio';
	import { audioState } from '../state/audio.state.svelte';

	const displayVisualization = $derived(audioState.isPlaying && podcastState.selectedPodcastUrl);

	let selectedPodcast = $derived(podcastState.selectedPodcast);

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	let pictureInPicture = $derived(pictureInPictureState.pictureInPicture);

	let canvasTransferred = $state(false);

	let visualizationCanvasWorker: Worker | undefined = undefined;

	let initialized = $state(false);

	function getCanvasElement(): HTMLCanvasElement | undefined {
		const canvas = document.getElementById(VISUALIZER_CANVAS_ID) as HTMLCanvasElement;

		return canvas;
	}

	function getVisualizerCanvasWorkerRequest(
		draw: boolean,
		canvas?: OffscreenCanvas,
		skipDraw?: boolean
	): VisualizerCanvasWorkerRequest {
		const style = window.getComputedStyle(document.body);

		const fillStyle = style.getPropertyValue('--background') || 'white';

		return {
			canvas,
			draw,
			pictureInPicture,
			imageUrl: selectedPodcast?.imageUrl,
			text: selectedPodcast?.name,
			fillStyle,
			skipDraw
		};
	}

	async function draw(): Promise<void> {
		if (!visualizationCanvasWorker) {
			console.error('Unable to draw to visualizer canvas, worker null.');

			return;
		}

		if (!canvasTransferred) {
			const canvas = getCanvasElement();

			if (!canvas) {
				console.error('Unable to draw to visualizer canvas, element null.');

				return;
			}

			const transferredCanvas = canvas.transferControlToOffscreen();

			canvasTransferred = true;

			const request = getVisualizerCanvasWorkerRequest(true, transferredCanvas);

			visualizationCanvasWorker.postMessage(request, [transferredCanvas]);
		} else {
			const request = getVisualizerCanvasWorkerRequest(true);

			visualizationCanvasWorker.postMessage(request);
		}
	}

	function stopDrawing(): void {
		if (!visualizationCanvasWorker) {
			console.error('Unable to stop drawing to visualizer canvas, worker null.');

			return;
		}

		const request = getVisualizerCanvasWorkerRequest(false);

		visualizationCanvasWorker.postMessage(request);
	}

	$effect(() => {
		if (displayVisualization) {
			untrack(async () => {
				if (!initialized) {
					return;
				}

				draw();
			});
		} else {
			untrack(() => {
				if (!initialized) {
					return;
				}
				stopDrawing();
			});
		}
	});

	$effect(() => {
		if (selectedPodcastUrl) {
			untrack(async () => {
				if (selectedPodcast?.imageUrl) {
					if (!visualizationCanvasWorker) {
						console.error('Unable to stop drawing to visualizer canvas, worker null.');

						return;
					}

					const request = getVisualizerCanvasWorkerRequest(false, undefined, true);

					visualizationCanvasWorker.postMessage(request);
				}
			});
		}
	});

	function updatePip(): void {
		if (!initialized) {
			return;
		}

		if (!visualizationCanvasWorker) {
			console.error('Unable to stop drawing to visualizer canvas, worker null.');

			return;
		}

		const request = getVisualizerCanvasWorkerRequest(false, undefined, true);

		visualizationCanvasWorker.postMessage(request);
	}

	$effect(() => {
		if (pictureInPicture) {
			untrack(async () => {
				updatePip();
			});
		} else {
			untrack(async () => {
				updatePip();
			});
		}
	});

	async function loadVisualizationCanvasWorker(): Promise<void> {
		const worker = await import('#lib/audio/worker/visualizer-canvas.worker?worker');
		visualizationCanvasWorker = new worker.default();
	}

	function setupCanvasAndVideoForPiP(): void {
		const canvas = document.getElementById(VISUALIZER_CANVAS_ID) as HTMLCanvasElement;

		if (!canvas) {
			console.error('Unable to enter Picture in Picture mode, canvas element null.');

			return;
		}

		const stream = canvas.captureStream(30); // 30 FPS

		const video = document.getElementById(VISUALIZER_VIDEO_ID) as HTMLVideoElement;
		if (!video) {
			console.error('Unable to enter Picture in Picture mode, video element null.');

			return;
		}

		video.srcObject = stream;
		video.muted = true;
		video.controls = true;
		video.loop = true;

		video.onvolumechange = (e) => {
			// debugger;

			// TODO: get mute/unmute button in PiP window to work. All other media controls work
			// but media session handlers provide no mute/unmute event.
			// Remove if found not to trigger in prod
			console.log(`Testing to see if PiP video can trigger this event (for mute/unmute)`);
		};
	}

	async function init(): Promise<void> {
		await loadVisualizationCanvasWorker();

		setupCanvasAndVideoForPiP();

		initialized = true;
	}

	onMount(async () => {
		await init();
	});
</script>

<canvas id={VISUALIZER_CANVAS_ID} class="h-full w-full" class:invisible={pictureInPicture}></canvas>
<video id={VISUALIZER_VIDEO_ID} class:invisible={!pictureInPicture}></video>
