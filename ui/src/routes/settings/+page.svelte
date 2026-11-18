<script lang="ts">
	import { layoutState$$setNavMenuOpen } from '#lib/layout/layout-state.svelte.ts';
	import type { UserSettings } from '#lib/settings/model/index.ts';
	import { SettingsService } from '#lib/settings/service/settings-service.svelte.ts';
	import {
		settingsState,
		settingsState$$setLightMode,
		settingsState$$setTranscriptionLanguage
	} from '#lib/settings/settings.state.svelte.ts';
	import LightDarkModeToggle from '#lib/theme/component/LightDarkModeToggle.svelte';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { onMount } from 'svelte';

	onMount(() => {
		layoutState$$setNavMenuOpen(false);
	});

	let transcriptionLanguage = $derived(settingsState.transcriptionLanguage);

	let lightMode = $derived(settingsState.lightMode);

	// TODO: place in other constants or i18 file...
	const languages = ['en', 'es', 'fr'];

	async function saveUserSettings(): Promise<void> {
		const settings: UserSettings = {
			lightMode,
			transcriptionLanguage
		};
		await SettingsService.saveUserSettings(settings);
	}

	function handleLightModeToggleClick(): void {
		VibrationService.vibrate();

		settingsState$$setLightMode(!lightMode);

		saveUserSettings();
	}

	function handleTranscriptionLanguageChange(e: Event): void {
		const language = (e.target as HTMLSelectElement)?.value;
		if (language) {
			settingsState$$setTranscriptionLanguage(language);

			console.log(`Transcription language changed to: ${language}`);

			saveUserSettings();
		}
	}
</script>

<div class="flex flex-col gap-6">
	<LightDarkModeToggle {handleLightModeToggleClick} />

	<label class="flex max-w-8/12 flex-col">
		<span>Transcription Language</span>
		<select bind:value={transcriptionLanguage} oninput={handleTranscriptionLanguageChange}>
			{#each languages as language (language)}
				<option value={language}>{language}</option>
			{/each}
		</select>
	</label>
</div>
