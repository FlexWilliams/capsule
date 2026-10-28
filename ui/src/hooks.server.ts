import { PUBLIC_TEST_ACTIVATED } from '$app/env/public';
import { sequence, type Handle, type HandleFetch } from '@sveltejs/kit/hooks';

import {
	handle as handleHttpMocks,
	handleFetch as handleMockedResponses
} from '#lib/server/mocks/index.ts';

export const handle = sequence(handleHttpMocks(PUBLIC_TEST_ACTIVATED === 'true')) satisfies Handle;

export const handleFetch = (async ({ request, fetch, event }) => {
	const mockedResponse = handleMockedResponses(request, event);

	if (mockedResponse) {
		return mockedResponse;
	}

	return fetch(request);
}) satisfies HandleFetch;
