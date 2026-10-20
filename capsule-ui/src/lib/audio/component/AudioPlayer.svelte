<script lang="ts">
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { onMount, untrack } from 'svelte';
	import { audioState, audioState$$setLoading } from '../state/audio.state.svelte';

	const audioPlayerId = 'audio-player';

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	let isPlaying = $derived(audioState.isPlaying);

	function getAudioElement(): HTMLAudioElement | null {
		const audioPlayer = document.getElementById(audioPlayerId) as HTMLAudioElement;

		return audioPlayer || null;
	}

	function initAudioPlayer(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			console.error(`[initAudioPlayer] Unable to play audio, <audio> element not found!`);

			return;
		}
	}

	async function handleCanPlay(e: Event): Promise<void> {
		const audioPlayer = e.target as HTMLAudioElement;

		if (!audioPlayer) {
			console.error(`[handleCanPlay] Unable to play audio, <audio> element not found!`);

			return;
		}

		await audioPlayer.play();

		audioState$$setLoading(false);

		console.log(`Podcast now playing...`);
	}

	function pause(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			console.error(`[pause] Unable to play audio, <audio> element not found!`);

			return;
		}

		audioPlayer.pause();
	}

	async function play(): Promise<void> {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			console.error(`[pause] Unable to play audio, <audio> element not found!`);

			return;
		}

		await audioPlayer.play();
	}

	async function loadPodcast(url: string): Promise<void> {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			console.error(`[loadPodcast] Unable to play audio, <audio> element not found!`);

			return;
		}

		audioPlayer.pause();

		audioState$$setLoading(true);

		audioPlayer.src = url;

		audioPlayer.oncanplay = handleCanPlay;
	}

	$effect(() => {
		if (selectedPodcastUrl) {
			untrack(() => {
				console.log(`Request for new podcast URL: ${selectedPodcastUrl}`);

				loadPodcast(selectedPodcastUrl);
			});
		}
	});

	$effect(() => {
		if (isPlaying) {
			untrack(async () => {
				if (selectedPodcastUrl) {
					await play();
				}
			});
		} else {
			untrack(() => {
				pause();
			});
		}
	});

	onMount(() => {
		initAudioPlayer();
	});
</script>

<audio id={audioPlayerId}></audio>
