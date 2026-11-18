// import type { SavedHabit } from '$lib/habits/model';
// import type { SavedNote } from '$lib/note';
// import { habitsStorageKey, notesStorageKey, todosStorageKey } from '$lib/storage/keys';
// import { StorageService } from '$lib/storage/storage-service';
// import type { SavedTodo } from '$lib/todo/model';
// import { SvelteDate } from 'svelte/reactivity';
// import type { DataExport } from '..';
// import { exportState$$setExporting } from '../state';

// export class ExportService {
// 	public static async handleExportData(): Promise<void> {
// 		exportState$$setExporting(true);

// 		// TODO: [PERF] offload to worker if taking too long on UI...
// 		const notes = (await StorageService.getListFromStorage<SavedNote>(notesStorageKey)) || [];
// 		const todos = (await StorageService.getListFromStorage<SavedTodo>(todosStorageKey)) || [];
// 		const habits = (await StorageService.getListFromStorage<SavedHabit>(habitsStorageKey)) || [];

// 		const exportData: DataExport = {
// 			notes,
// 			todos,
// 			habits
// 		};

// 		const content = JSON.stringify(exportData, null, 2);
// 		const date = new SvelteDate().toLocaleDateString().replace(/\//g, '-');
// 		const a = document.createElement('a');
// 		const file = new Blob([content], { type: 'application/json' });
// 		a.href = URL.createObjectURL(file);
// 		a.download = `thought_drop.v2-Export_${date}.json`;
// 		a.click();

// 		exportState$$setExporting(false);
// 	}
// }
