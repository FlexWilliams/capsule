/**
 * Direct copy via: https://github.com/markjaquith/sveltekit-playwright-fetch-mock/blob/main/src/handle.ts
 * Thank you
 */

import type { Handle } from '@sveltejs/kit/hooks';

export const COOKIE_NAME = 'mockFetch';

export type FetchMock = {
	status: number;
	statusText: string;
	headers?: Record<string, string>;
	body: string;
};
export type FetchMocks = Record<string, FetchMock>;

export type Locals = App.Locals & {
	fetchMocks: FetchMocks;
};

const handle = (isPlaywright: boolean) =>
	(async ({ event, resolve }) => {
		if (isPlaywright) {
			console.debug(`Test mode activated for handle()`);
			(event.locals as Locals).fetchMocks = JSON.parse(event.cookies.get(COOKIE_NAME) ?? '{}');
		}

		return resolve(event);
	}) satisfies Handle;

export default handle;
