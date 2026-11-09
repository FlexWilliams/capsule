<script lang="ts">
	import { MediaSessionService } from '#lib/media-session/media-session-service.svelte.ts';
	import type { MediaSessionEventHandlers } from '#lib/media-session/media-session.ts';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { podcastState } from '#lib/podcast/state/podcast.state.svelte.ts';
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';
	import type { WhisperTranscription } from '#lib/transcription/transcription.ts';
	import { interval, Subscription, tap } from 'rxjs';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { TranscriptionService } from '../../transcription/transcription-service.svelte';
	import { VISUALIZER_VIDEO_ID } from '../audio';
	import {
		AudioAction,
		AudioService,
		type AudioEvent,
		type SeekData
	} from '../service/audio.service.svelte';
	import {
		audioState,
		audioState$$setCurrentCueText,
		audioState$$setCurrentTime,
		audioState$$setDuration,
		audioState$$setLoading
	} from '../state/audio.state.svelte';

	import { SPEECH_TO_TEXT_API_URL } from '$app/env/public';

	const subscriptions: Subscription[] = [];

	const audioPlayerId = 'audio-player';

	let selectedPodcast = $derived(podcastState.selectedPodcast);

	let selectedPodcastUrl = $derived(podcastState.selectedPodcastUrl);

	let selectedPodcastDirectUrl = $derived(podcastState.selectedPodcastDirectUrl);

	let selectedPodcastTranscriptionUrl = $derived(podcastState.selectedPodcastTranscriptionUrl);

	let isPlaying = $derived(audioState.isPlaying);

	let currentTime = $derived(audioState.currentTime);

	let duration = $derived(audioState.duration);

	let skip = $derived(settingsState.skip);

	let skipAdInterval = $derived(settingsState.skipAd);

	let textTrack: TextTrack | null = $state(null);

	let transcriptionSub: Subscription | null = $state(null);

	function getAudioElement(): HTMLAudioElement | null {
		const audioPlayer = document.getElementById(audioPlayerId) as HTMLAudioElement;

		return audioPlayer || null;
	}

	function createTextTrack(): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('createTextTrack');
		}

		textTrack = audioPlayer.addTextTrack('captions', 'Captions', 'en');

		textTrack.mode = 'showing';

		textTrack.oncuechange = () => {
			const cues = textTrack?.activeCues;

			if (cues) {
				for (let c of cues) {
					const { text } = c as VTTCue;

					audioState$$setCurrentCueText(text);
				}
			}
		};
	}

	function addTextTrack(transcriptions: WhisperTranscription[]): void {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('addTextTrack');
		}

		if (!textTrack) {
			return logAudioPlayerError('addTextTrack (no textTrack)');
		}

		for (const t of transcriptions) {
			const { fromInSeconds, toInSeconds } = t.timestamps;

			textTrack.addCue(new VTTCue(fromInSeconds, toInSeconds, t.text));
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

		PodcastService.setSelectedPodcastDirectUrl(newEpisode.directUrl || null);
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
			console.error(`Unable to play next podcast episode, new episode invalid!`);

			return;
		}

		PodcastService.setSelectedPodcastDirectUrl(newEpisode.directUrl || null);
		PodcastService.setSelectedPodcastUrl(newEpisode.url);
	}

	function rewind(): void {
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('rewind');
		}

		console.log(`Rewinding ${skip} seconds...`);

		audio.currentTime = Math.max(0, audio.currentTime - skip);
	}

	function fastForward(): void {
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('fastForward');
		}

		console.log(`Fast forwarding ${skip} seconds...`);

		audio.currentTime = Math.min(audio.duration, audio.currentTime + skip);
	}

	function skipAd(): void {
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('skipAd');
		}

		console.log(`(SkipAd) Fast forwarding ${skipAdInterval} seconds...`);

		audio.currentTime = Math.min(audio.duration, audio.currentTime + skipAdInterval);
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

	function mute(): void {
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('mute');
		}

		console.log(`Muting audio...`);

		audio.muted = true;
	}

	function unmute(): void {
		const audio = getAudioElement();

		if (!audio) {
			return logAudioPlayerError('unmute');
		}

		console.log(`Un-muting audio...`);

		audio.muted = false;
	}

	async function handleAudioEvent(evt: AudioEvent): Promise<void> {
		console.log(`New audio event: ${evt.action}`);

		switch (evt.action) {
			case AudioAction.Play:
				await play();
				toggleVideoPlaying(true);
				break;
			case AudioAction.Pause:
				pause();
				toggleVideoPlaying(false);
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
			case AudioAction.SkipAd:
				skipAd();
				break;
			case AudioAction.Seek:
				seekTo((evt?.data as SeekData)?.position);
				break;
			case AudioAction.Mute:
				mute();
				break;
			case AudioAction.Unmute:
				unmute();
				break;
			default:
				console.log(`Unknown audio event: ${evt.action}`);
		}
	}

	function listenForTranscriptions(): Subscription {
		return TranscriptionService.transcription$
			.pipe(
				tap((transcriptions: WhisperTranscription[]) => {
					addTextTrack(transcriptions);
				})
			)
			.subscribe();
	}

	function listenForAudioEvents(): Subscription {
		return AudioService.audio$$
			.pipe(
				tap(async (evt) => {
					await handleAudioEvent(evt);
				})
			)
			.subscribe();
	}

	async function updateMediaSession(): Promise<void> {
		if (!selectedPodcastUrl || !selectedPodcast || !selectedPodcast.episodes) {
			return;
		}

		const current = selectedPodcast.episodes.find((e) => e.url === selectedPodcastUrl);
		if (!current) {
			console.warn(`Unable to update the media session, episode not found!`);

			return;
		}

		await MediaSessionService.updateMediaSession(selectedPodcast, current, currentTime, duration);
	}

	async function updateAudioTime(): Promise<void> {
		const audioPlayer = getAudioElement();

		if (!audioPlayer) {
			return logAudioPlayerError('updateAudioTime');
		}

		audioState$$setCurrentTime(audioPlayer.currentTime);

		if (isPlaying) {
			await updateMediaSession();
		}
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

		const handlers = {
			play: AudioService.play,
			pause: AudioService.pause,
			stop: async () => {},
			seekTo: AudioService.seekTo,
			seekBackward: AudioService.rewind,
			seekForward: AudioService.fastForward,
			skipad: AudioService.skipAd,
			previousTrack: AudioService.rewind,
			nextTrack: AudioService.fastForward
		} as MediaSessionEventHandlers;

		MediaSessionService.initMediaSession(handlers);

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

		MediaSessionService.pauseMediaSessionAudio();
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

		MediaSessionService.playMediaSessionAudio();
	}

	// TODO: should this be handled here or in the pip service??
	function toggleVideoPlaying(play?: boolean): void {
		const videoPlayer = document.getElementById(VISUALIZER_VIDEO_ID) as HTMLVideoElement;
		if (videoPlayer) {
			if (play) {
				videoPlayer.play();
			} else {
				videoPlayer.pause();
			}
		}
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

		try {
			const response = await fetch(`${SPEECH_TO_TEXT_API_URL}/via-url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					url
				})
			});

			if (!response.ok) {
				console.error(`Error loading podcast via url, defaulting to original url.`);

				audioPlayer.src = url;
			} else {
				const directUrl = await response.text();

				audioPlayer.src = directUrl;
			}

			audioPlayer.oncanplay = handleCanPlay;
		} catch {
			console.error(`Error loading podcast for url: ${url}`);
		}
	}

	$effect(() => {
		if (selectedPodcastUrl) {
			untrack(() => {
				console.log(
					`Request for new podcast URL: ${selectedPodcastDirectUrl || selectedPodcastUrl}`
				);

				loadPodcast(selectedPodcastDirectUrl || selectedPodcastUrl);
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

	$effect(() => {
		// TODO: review if this is the best solution
		// dificult when the audio playing and transction are unrelated.
		// how to remove/add tracks effectively without disruption?
		if (selectedPodcastTranscriptionUrl) {
			untrack(() => {
				if (transcriptionSub) {
					transcriptionSub.unsubscribe();
				}
				// TODO: try to remove or disable previous text track, see:
				// https://stackoverflow.com/questions/29306931/delete-a-texttrack-from-a-video
				createTextTrack();

				transcriptionSub = listenForTranscriptions();

				subscriptions.push(transcriptionSub);
			});
		}
	});

	onMount(() => {
		subscriptions.push(listenForAudioEvents());
		subscriptions.push(listenForCurrentTime());
	});

	onDestroy(() => {
		subscriptions.forEach((sub) => sub.unsubscribe());
	});
</script>

<audio id={audioPlayerId}></audio>
