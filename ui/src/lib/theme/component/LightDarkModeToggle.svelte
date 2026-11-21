<script lang="ts">
	import { settingsState } from '#lib/settings/settings.state.svelte.ts';

	import moon from '#lib/assets/icons/at-icons--moon.svg';
	import sun from '#lib/assets/icons/at-icons--sun.svg';

	interface LightDarkModeToggleProps {
		handleLightModeToggleClick(): void;
	}

	let { handleLightModeToggleClick }: LightDarkModeToggleProps = $props();

	let lightMode = $derived(settingsState.lightMode);
</script>

<button
	onclick={handleLightModeToggleClick}
	class="h-10 w-full cursor-pointer rounded-full bg-button text-button-text shadow-md"
>
	{#if lightMode}
		<div class="flex items-center justify-center gap-2 px-2">
			<img src={moon} alt="Moon" />
			<span>Dark Mode?</span>
		</div>
	{:else}
		<div class="flex items-center justify-center gap-2 px-2">
			<img src={sun} alt="Sun" />
			<span>Light Mode?</span>
		</div>
	{/if}
</button>
