import { expect, test } from 'vitest';
import { AudioService } from './audio.service.svelte';

test.describe('Audio Service', () => {
	test('should be defined', () => {
		const service = AudioService;

		expect(service).toBeDefined();
	});

	// TODO: find way to test observables...
	// See: https://stackblitz.com/edit/vitest-dev-vitest-wwehhk?file=test%2Frxjs.test.ts
	test.skip('play()', () => {});

	test.skip('pause()', () => {});

	test.skip('previous()', () => {});

	test.skip('next()', () => {});

	test.skip('rewind()', () => {});

	test.skip('fastForward()', () => {});

	test.skip('seek()', () => {});
});
