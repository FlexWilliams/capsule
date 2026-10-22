<script lang="ts">
	import {
		settingsState,
		settingsState$$setLightMode
	} from '#lib/settings/settings.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { untrack } from 'svelte';

	let lightMode = $derived(settingsState.lightMode);

	function handleLightModeToggleClick(): void {
		VibrationService.vibrate();

		if (lightMode) {
			settingsState$$setLightMode(false);
		} else {
			settingsState$$setLightMode(true);
		}

		saveLightModePreference();
	}

	function saveLightModePreference(): void {
		// TODO: impl during localforage
	}

	// TODO: handle below in a LightDarkModeService method() to be called onMount() in root layout
	// to pull from local storage whether to apply previous setting
	function applyLightMode(): void {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
	}

	function applyDarkMode(): void {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
	}

	$effect(() => {
		if (lightMode) {
			applyLightMode();
		} else {
			untrack(() => {
				applyDarkMode();
			});
		}
	});
</script>

<button
	onclick={handleLightModeToggleClick}
	class="50 absolute top-2 right-8 h-10 w-30 rounded-full bg-button text-button-text"
>
	{#if lightMode}
		<span>Dark Mode?</span>
	{:else}
		<span>Light Mode?</span>
	{/if}
</button>
