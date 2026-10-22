<script lang="ts">
	import favicon from '#lib/assets/favicon.ico';
	import AudioPlayer from '#lib/audio/component/AudioPlayer.svelte';
	import Footer from '#lib/layout/footer/Footer.svelte';
	import Header from '#lib/layout/header/Header.svelte';
	import Main from '#lib/layout/main/Main.svelte';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children }: LayoutProps = $props();
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
