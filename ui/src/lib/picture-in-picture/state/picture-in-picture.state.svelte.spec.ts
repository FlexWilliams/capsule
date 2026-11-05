import { expect, test } from 'vitest';
import {
	pictureInPictureState,
	pictureInPictureState$$setPictureInPicture
} from './picture-in-picture.state.svelte';

test('state should be defined', () => {
	const state = pictureInPictureState;

	expect(state).toBeDefined();
});

test('initial state should contain correct default values', () => {
	const state = pictureInPictureState;

	expect(state.pictureInPicture).toEqual(false);
});

test('pictureInPictureState$$setPictureInPicture', () => {
	const state = pictureInPictureState;

	pictureInPictureState$$setPictureInPicture(true);
	expect(state.pictureInPicture).toEqual(true);
	pictureInPictureState$$setPictureInPicture(false);
	expect(state.pictureInPicture).toEqual(false);
});
