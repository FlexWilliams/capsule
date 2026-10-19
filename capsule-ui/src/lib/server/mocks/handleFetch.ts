/**
 * Modified from original: https://github.com/markjaquith/sveltekit-playwright-fetch-mock/blob/main/src/handleFetch.ts
 * Thank you
 */
import type { RequestEvent as SvelteRequestEvent } from '@sveltejs/kit';
import type { Locals } from './handle';

type RequestEvent = SvelteRequestEvent & { locals: Locals };

export default function handleFetch(request: Request, event: RequestEvent): Response | null {
	const { locals } = event;
	if (locals.fetchMocks) {
		try {
			Object.entries(locals.fetchMocks).forEach(([pattern, response]) => {
				const json = JSON.parse(response.body);

				const body =
					typeof json === 'object' && Object.prototype.hasOwnProperty.call(json, 'testBuffer')
						? new ArrayBuffer(json.testBuffer)
						: response.body;

				if (request.url.match(new RegExp(pattern))) {
					throw new Response(body ?? '', {
						status: response.status ?? 200,
						statusText: response.statusText ?? 'OK',
						headers: response.headers ?? {}
					});
				}
			});
		} catch (response) {
			if (!(response instanceof Response)) {
				throw new Error('Something other than a response was thrown', { cause: response });
			}
			return response;
		}
	}

	return null;
}
