<script lang="ts">
	import { layoutState$$setNavMenuOpen } from '#lib/layout/layout-state.svelte.ts';
	import {
		settingsState,
		settingsState$$setTranscriptionLanguage
	} from '#lib/settings/settings.state.svelte.ts';
	import LightDarkModeToggle from '#lib/theme/component/LightDarkModeToggle.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		layoutState$$setNavMenuOpen(false);
	});

	let transcriptionLanguage = $derived(settingsState.transcriptionLanguage);

	// TODO: place in other constants or i18 file...
	const languages = ['en', 'es', 'fr'];

	function handleTranscriptionLanguageChange(e: Event): void {
		const language = (e.target as HTMLSelectElement)?.value;
		if (language) {
			settingsState$$setTranscriptionLanguage(language);

			console.log(`Transcription language changed to: ${language}`);
		}
	}
</script>

<div class="flex flex-col gap-6">
	<LightDarkModeToggle />

	<label class="flex max-w-8/12 flex-col">
		<span>Transcription Language</span>
		<select bind:value={transcriptionLanguage} oninput={handleTranscriptionLanguageChange}>
			{#each languages as language (language)}
				<option value={language}>{language}</option>
			{/each}
		</select>
	</label>
</div>
