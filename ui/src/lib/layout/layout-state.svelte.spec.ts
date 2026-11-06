import { expect, test } from 'vitest';
import {
	layoutState,
	layoutState$$setNavMenuOpen,
	layoutState$$toggleNavMenu
} from './layout-state.svelte';

test('state should be defined', () => {
	const state = layoutState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = layoutState;

	expect(state.navMenuOpen).toEqual(false);
});

test('layoutState$$navMenuOpen', () => {
	const state = layoutState;

	expect(state.navMenuOpen).toEqual(false);

	layoutState$$setNavMenuOpen(true);
	expect(state.navMenuOpen).toEqual(true);
	layoutState$$setNavMenuOpen(false);
	expect(state.navMenuOpen).toEqual(false);
});

test('layoutState$$toggleNavMenu', () => {
	const state = layoutState;

	expect(state.navMenuOpen).toEqual(false);

	layoutState$$toggleNavMenu();
	expect(state.navMenuOpen).toEqual(true);
	layoutState$$toggleNavMenu();
	expect(state.navMenuOpen).toEqual(false);
});
