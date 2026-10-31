<script lang="ts">
	import favicon from '#lib/assets/favicon.ico';
	import AudioPlayer from '#lib/audio/component/AudioPlayer.svelte';
	import Footer from '#lib/layout/footer/Footer.svelte';
	import Header from '#lib/layout/header/Header.svelte';
	import Main from '#lib/layout/main/Main.svelte';
	import { SPEECH_TO_TEXT_WSS_URL } from '$app/env/public';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children }: LayoutProps = $props();

	let webSocket: WebSocket | null = $state(null);

	// Function to send a message
	// function sendWssMessage() {
	// 	if (!webSocket) {
	// 		console.error(`Unable to send wss message, wss null!`);

	// 		return;
	// 	}

	// 	const message = JSON.stringify({
	// 		podcastUrl:
	// 			'https://podtrac.com/pts/redirect.mp3/traffic.omny.fm/d/clips/e73c998e-6e60-432f-8610-ae210140c5b1/a6fe610a-4ca3-4b46-afc6-ae2c007b3c35/ebdb47f1-6ccd-40bc-80e1-b4f2018ace5e/audio.mp3?utm_source=Podcast&in_playlist=1c5eae1a-4416-4dcc-b699-ae2c007b3c48Mb',
	// 		podcastImageUrl:
	// 			'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/a6fe610a-4ca3-4b46-afc6-ae2c007b3c35/1c5eae1a-4416-4dcc-b699-ae2c007b3c48/image.jpg?t=1726512474&size=Large'
	// 	});

	// 	webSocket.send(message);
	// }

	function setupWss(): void {
		// Connect to the WebSocket server
		webSocket = new WebSocket(SPEECH_TO_TEXT_WSS_URL);

		// Connection opened
		webSocket.onopen = () => {
			console.log(`Connection opened!`);
		};

		// Listen for messages
		webSocket.onmessage = (event) => {
			console.log(event.data);
		};

		// Handle errors
		webSocket.onerror = (error) => {
			console.log(error);
		};

		// Handle connection close
		webSocket.onclose = () => {
			console.log(`Connection closed!`);
		};
	}

	onMount(() => {
		setupWss();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative h-full w-full overflow-hidden bg-background">
	<Header />

	<Main {children} />

	<Footer />

	<AudioPlayer />
</div>
