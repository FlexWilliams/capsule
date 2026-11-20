<script lang="ts">
	import menuDark from '#lib/assets/icons/dark/stash--burger-classic.svg';
	import menuLight from '#lib/assets/icons/light/stash--burger-classic.svg';
	import EpisodeMarquee from '#lib/podcast/components/episode/EpisodeMarquee.svelte';
	// import AudioVisualizer from '#lib/audio/component/AudioVisualizer.svelte';
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { layoutState$$toggleNavMenu } from '../layout-state.svelte';

	let lightMode = $derived(settingsState.lightMode);

	function toggleMenu(): void {
		VibrationService.vibrate();

		layoutState$$toggleNavMenu();
	}
</script>

<header
	class="rounded-b-mdshadow-sm flex h-1/12 max-h-1/12 w-full items-center justify-between shadow-slate-300"
>
	<div class="flex-1"></div>
	<div class="h-8/12 flex-3">
		<!-- <AudioVisualizer /> -->

		<EpisodeMarquee />
	</div>
	<button
		aria-label="Open Menu"
		class="h-8 w-20 flex-1 cursor-pointer items-center justify-center rounded-full"
		onclick={toggleMenu}
		><img src={lightMode ? menuLight : menuDark} alt="Open" class="h-10/12 w-6/12" /></button
	>
</header>
