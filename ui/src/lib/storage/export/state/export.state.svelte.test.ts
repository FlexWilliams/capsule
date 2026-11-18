import { expect, test } from 'vitest';
import { exportState, exportState$$setExporting } from './export.state.svelte';

test('state should be defined', () => {
	const state = exportState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = exportState;

	expect(state.exporting).toBeFalsy();
});

test('exportState$$setExporting', () => {
	const state = exportState;

	expect(state.exporting).toBeFalsy();

	exportState$$setExporting(true);
	expect(state.exporting).toBeTruthy();
	exportState$$setExporting(false);
	expect(state.exporting).toBeFalsy();
});
