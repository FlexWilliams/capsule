<script lang="ts">
	import favicon from '#lib/assets/favicon.ico';
	import AudioPlayer from '#lib/audio/component/AudioPlayer.svelte';
	import Footer from '#lib/layout/footer/Footer.svelte';
	import Header from '#lib/layout/header/Header.svelte';
	import Main from '#lib/layout/main/Main.svelte';
	import Nav from '#lib/layout/Nav/Nav.svelte';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import { SettingsService } from '#lib/settings/service/settings-service.svelte.ts';
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';
	import { StorageService } from '#lib/storage/storage-service.ts';
	import { LightDakModeService } from '#lib/theme/service/light-dark-mode-service.svelte.ts';
	import { WebSocketService } from '#lib/web-socket/web-socket-service.svelte.ts';
	import { onMount, untrack } from 'svelte';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { children }: LayoutProps = $props();

	let lightMode = $derived(settingsState.lightMode);

	$effect(() => {
		if (lightMode) {
			untrack(() => LightDakModeService.applyLightMode());
		} else {
			untrack(() => LightDakModeService.applyDarkMode());
		}
	});

	onMount(async () => {
		WebSocketService.connect();

		await StorageService.init();

		SettingsService.loadUserSettings();

		PodcastService.fetchMyFavorites();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative h-full w-full overflow-hidden bg-background">
	<Header />

	<Nav />

	<Main {children} />

	<Footer />

	<AudioPlayer />
</div>
