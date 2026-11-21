<script lang="ts">
	import download from '#lib/assets/icons/at-icons--arrow-down-to-bracket.svg';
	import { layoutState$$setNavMenuOpen } from '#lib/layout/layout-state.svelte.ts';
	import type { UserSettings } from '#lib/settings/model/index.ts';
	import { SettingsService } from '#lib/settings/service/settings-service.svelte.ts';
	import {
		settingsState,
		settingsState$$setLightMode,
		settingsState$$setTranscriptionLanguage
	} from '#lib/settings/settings.state.svelte.ts';
	import { exportState } from '#lib/storage/export/index.ts';
	import { ExportService } from '#lib/storage/export/service/ExportService.svelte.ts';
	import LightDarkModeToggle from '#lib/theme/component/LightDarkModeToggle.svelte';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { onMount } from 'svelte';

	onMount(() => {
		layoutState$$setNavMenuOpen(false);
	});

	let transcriptionLanguage = $derived(settingsState.transcriptionLanguage);

	let lightMode = $derived(settingsState.lightMode);

	let exportingData = $derived(exportState.exporting);

	// TODO: place in other constants or i18 file...
	const languages = ['auto', 'en', 'es', 'fr'];

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

<h2 class="text-center text-2xl text-text">Settings</h2>

<div class="mt-4 flex w-full flex-col gap-6">
	<label class="flex flex-col text-text">
		<span>Transcription Language:</span>
		<select
			name="transcription-language"
			class="h-10 rounded-full border bg-input-bg text-center text-input-text"
			bind:value={transcriptionLanguage}
			oninput={handleTranscriptionLanguageChange}
		>
			{#each languages as language (language)}
				<option value={language}>{language}</option>
			{/each}
		</select>
	</label>

	<LightDarkModeToggle {handleLightModeToggleClick} />

	<button
		class="h-10 max-h-10 w-full cursor-pointer rounded-full bg-button text-button-text shadow-md"
		onclick={ExportService.handleExportData}
		disabled={exportingData}
	>
		<div class="flex h-full items-center justify-center gap-2 px-2">
			<img src={download} alt="Export" class="h-6/12" />
			<span>Export Data</span>
		</div>
	</button>
</div>
