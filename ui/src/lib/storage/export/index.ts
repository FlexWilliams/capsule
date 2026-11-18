import type { SavedHabit } from '$lib/habits/model';
import type { SavedNote } from '$lib/note';
import type { SavedTodo } from '$lib/todo/model';

export type DataExport = {
	notes: SavedNote[];
	todos: SavedTodo[];
	habits: SavedHabit[];
};

export * from './state';
