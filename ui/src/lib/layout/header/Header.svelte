<script lang="ts">
	import menu from '#lib/assets/icons/stash--burger-classic.svg';
	import AudioVisualizer from '#lib/audio/component/AudioVisualizer.svelte';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { resolve } from '$app/paths';
	import { layoutState$$toggleNavMenu } from '../layout-state.svelte';

	function toggleMenu(): void {
		VibrationService.vibrate();

		layoutState$$toggleNavMenu();
	}
</script>

<header
	class="rounded-b-mdshadow-sm relative flex h-1/12 max-h-1/12 w-full items-center shadow-slate-300"
>
	<a href={resolve('/')} class="absolute top-0 left-0 z-2 h-full w-full">
		<h1 class="sr-only w-full text-center text-3xl">Capsule</h1>
	</a>
	<div class="absolute top-0 left-0 z-1 h-full w-full">
		<AudioVisualizer />
	</div>
	<button
		aria-label="Open Menu"
		class="absolute top-1/4 right-2 z-2 mr-4 flex h-10 w-20 cursor-pointer items-center justify-center rounded-full"
		onclick={toggleMenu}><img src={menu} alt="Open" class="h-10/12 w-6/12" /></button
	>
</header>
