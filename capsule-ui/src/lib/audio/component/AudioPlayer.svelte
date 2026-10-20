<script lang="ts">
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';
	import { interval, Subscription, tap } from 'rxjs';
	import { onDestroy, onMount, untrack } from 'svelte';
	import {
		AudioAction,
		AudioService,
		type AudioEvent,
		type SeekData
	} from '../service/audio.service.svelte';
	import {
		audioState,
		audioState$$setCurrentTime,
		audioState$$setDuration,
		audioState$$setLoading
	} from '../state/audio.state.svelte';

	const subscriptions: Subscription[] = [];

	const audioPlayerId = 'audio-player';

	let selectedPodcast = $derived(podcastState.selectedPodcast);

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	let isPlaying = $derived(audioState.isPlaying);

	let skip = $derived(settingsState.skip);

	function getAudioElement(): HTMLAudioElement | null {
		const audioPlayer = document.getElementById(audioPlayerId) as HTMLAudioElement;

		return audioPlayer || null;
	}

	function initAudioPlayer(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('initAudioPlayer');
		}
	}

	function logAudioPlayerError(fn: string): void {
		console.error(`[${fn}] Unable to play audio, <audio> element not found!`);
	}

	function previous(): void {
		if (!selectedPodcastUrl || !selectedPodcast || !selectedPodcast.episodes) {
			return;
		}

		const currentIndex = selectedPodcast.episodes.findIndex((e) => e.url === selectedPodcastUrl);
		if (currentIndex === -1) {
			console.error(`Unable to play previous podcast episode, index not found!`);

			return;
		}

		const newPodcastIndex =
			currentIndex === 0 ? selectedPodcast.episodes.length - 1 : currentIndex - 1;
		const newEpisode = selectedPodcast.episodes[newPodcastIndex];

		if (!newEpisode || !newEpisode.url) {
			console.error(`Unable to play previous podcast episode, new episode invalid!`);

			return;
		}

		PodcastService.setSelectedPodcastUrl(newEpisode.url);
	}

	function next(): void {
		if (!selectedPodcastUrl || !selectedPodcast || !selectedPodcast.episodes) {
			return;
		}

		const currentIndex = selectedPodcast.episodes.findIndex((e) => e.url === selectedPodcastUrl);
		if (currentIndex === -1) {
			console.error(`Unable to play next podcast episode, index not found!`);

			return;
		}

		const newPodcastIndex =
			currentIndex >= selectedPodcast.episodes.length - 1 ? 0 : currentIndex + 1;
		const newEpisode = selectedPodcast.episodes[newPodcastIndex];

		if (!newEpisode || !newEpisode.url) {
			console.error(`Unable to play previous podcast episode, new episode invalid!`);

			return;
		}

		PodcastService.setSelectedPodcastUrl(newEpisode.url);
	}

	function rewind(): void {
		// TODO: vibration
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('rewind');
		}

		console.log(`Rewinding ${skip} seconds...`);

		audio.currentTime = Math.max(0, audio.currentTime - skip);
	}

	function fastForward(): void {
		// TODO: vibration
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('fastForward');
		}

		console.log(`Fast forwarding ${skip} seconds...`);

		audio.currentTime = Math.min(audio.duration, audio.currentTime + skip);
	}

	function seekTo(to?: number): void {
		if (!to) {
			return;
		}

		console.log(`Seeking to ${to}...`);

		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('seekTo');
		}

		audio.currentTime = to;
	}

	async function handleAudioEvent(evt: AudioEvent): Promise<void> {
		console.log(`New audio event: ${evt.action}`);

		switch (evt.action) {
			case AudioAction.Play:
				await play();
				break;
			case AudioAction.Pause:
				pause();
				break;
			case AudioAction.Previous:
				previous();
				break;
			case AudioAction.Next:
				next();
				break;
			case AudioAction.Rewind:
				rewind();
				break;
			case AudioAction.FastForward:
				fastForward();
				break;
			case AudioAction.Seek:
				seekTo((evt?.data as SeekData)?.position);
				break;
			default:
				console.log(`Unknown audio event: ${evt.action}`);
		}
	}

	function listenFoAudioEvents(): Subscription {
		return AudioService.audio$$
			.pipe(
				tap(async (evt) => {
					await handleAudioEvent(evt);
				})
			)
			.subscribe();
	}

	function updateAudioTime(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('updateAudioTime');
		}

		audioState$$setCurrentTime(audioPlayer.currentTime);
	}

	function listenForCurrentTime(): Subscription {
		return interval(500).pipe(tap(updateAudioTime)).subscribe();
	}

	async function handleCanPlay(e: Event): Promise<void> {
		const audioPlayer = e.target as HTMLAudioElement;

		if (!audioPlayer) {
			return logAudioPlayerError('handleCanPlay');
		}

		audioState$$setDuration(audioPlayer.duration);

		if (!isPlaying) {
			return audioState$$setLoading(false);
		}

		await audioPlayer.play();

		audioState$$setLoading(false);

		console.log(`Podcast now playing...`);
	}

	function pause(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('pause');
		}

		audioPlayer.pause();
	}

	async function play(): Promise<void> {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			console.error(`[pause] Unable to play audio, <audio> element not found!`);

			return;
		}

		if (!selectedPodcastUrl || !audioPlayer.src) {
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

		if (!audioPlayer.paused) {
			audioPlayer.pause();
		}

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
		}
	});

	onMount(() => {
		initAudioPlayer();

		subscriptions.push(listenFoAudioEvents());
		subscriptions.push(listenForCurrentTime());
	});

	onDestroy(() => {
		subscriptions.forEach((sub) => sub.unsubscribe());
	});
</script>

<audio id={audioPlayerId}></audio>
