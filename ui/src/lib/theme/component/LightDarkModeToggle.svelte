<script lang="ts">
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { LightDakModeService } from '../service/light-dark-mode-service.svelte';

	let lightMode = $derived(settingsState.lightMode);

	function handleLightModeToggleClick(): void {
		VibrationService.vibrate();

		LightDakModeService.setLightDarkMode(!lightMode);
	}
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
