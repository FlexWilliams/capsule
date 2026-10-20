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

<div class="capsule">
	<Header />

	<Main {children} />

	<Footer />

	<AudioPlayer />
</div>

<style lang="scss">
	.capsule {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
