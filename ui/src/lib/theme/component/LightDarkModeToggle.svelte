<script lang="ts">
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';

	interface LightDarkModeToggleProps {
		handleLightModeToggleClick(): void;
	}

	let { handleLightModeToggleClick }: LightDarkModeToggleProps = $props();

	let lightMode = $derived(settingsState.lightMode);
</script>

<button
	onclick={handleLightModeToggleClick}
	class="h-10 w-30 rounded-full bg-button text-button-text"
>
	{#if lightMode}
		<span>Dark Mode?</span>
	{:else}
		<span>Light Mode?</span>
	{/if}
</button>
