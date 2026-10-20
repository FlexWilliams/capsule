<script lang="ts">
	import podcastFeed from '#lib/assets/icons/ic--round-podcasts.svg';
	import type { Podcast, PodcastRssMeta } from '#lib/podcast/model/podcast.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const popoverId = 'add-via-rss';

	let fetching = $state(false);

	let podcast: Podcast | null = $state(null);

	let rssUrl: string | null = $state(null);

	async function handleSubmit(e: Event): Promise<void> {
		e.preventDefault();

		const form = e.target as HTMLFormElement;

		const formData = new FormData(form);

		rssUrl = formData.get('rss') as string;

		if (!rssUrl) {
			return;
		}

		fetching = true;

		podcast = await fetchPodcast(rssUrl);

		fetching = false;

		if (podcast) {
			// TODO: display 'goto rsspodcast screen'
		} else {
			// TODO: display 'error or retry clause
		}

		// dismissPopover();
	}

	async function fetchPodcast(rssUrl: string): Promise<Podcast | null> {
		const response = await fetch(`/api/rss`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ rssUrl })
		});

		if (response.ok) {
			return (await response.json()) as Podcast;
		} else {
			return null;
		}
	}

	function handleAddViaRssButtonClick(): void {
		showPopover();
	}

	function getPopover(): HTMLDialogElement | null {
		return document.getElementById(popoverId) as HTMLDialogElement;
	}

	function showPopover(): void {
		getPopover()?.showPopover();
	}

	async function handlePodcastClick(podcast: Podcast | null): Promise<void> {
		if (!podcast) {
			return;
		}

		// TODO: add vibration

		await savePodcastUrl(podcast);

		resetForm();

		dismissPopover();

		goto(resolve(`/podcasts/[id]?viaRss=true`, { id: podcast?.id || 'EMPTY' }));
	}

	function resetForm(): void {
		const form = document.getElementById('add-via-url') as HTMLFormElement;
		if (!form) {
			return;
		}

		form.reset();
	}

	async function savePodcastUrl(podcast: Podcast): Promise<void> {
		// TODO: update to use localforage

		const newPod: PodcastRssMeta = {
			name: podcast.name,
			id: podcast.id,
			rssUrl: podcast.rssUrl,
			imageUrl: podcast.imageUrl
		};

		const existing = localStorage.getItem('rss-podcasts');

		const podcasts: PodcastRssMeta[] = existing ? (JSON.parse(existing) as PodcastRssMeta[]) : [];

		if (podcasts.some((p) => p.rssUrl === newPod.rssUrl)) {
			// Already saved
			return;
		}

		podcasts.push(newPod);

		localStorage.setItem('rss-podcasts', JSON.stringify(podcasts));
	}

	function dismissPopover(): void {
		getPopover()?.hidePopover();
	}
</script>

<button
	class="absolute right-0 bottom-0 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent shadow-xl"
	aria-label="Add via rss url"
	onclick={handleAddViaRssButtonClick}
>
	<img src={podcastFeed} alt="Rss icon" class="h-5/12" />
</button>

<dialog id={popoverId} popover class="relative m-auto h-6/12 w-9/12 rounded-md p-8 shadow-md">
	<button
		type="button"
		aria-label="Close"
		onclick={dismissPopover}
		class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 p-4 text-xs"
		>X</button
	>
	<h3 class="h-2/12 text-center text-xl">Add podcast via Rss Url?</h3>

	<form id="add-via-url" name="add-via-url" onsubmit={handleSubmit} class="h-5/12">
		<label class="flex flex-col">
			Rss Url:
			<input type="text" name="rss" autocomplete="off" class="px-1" />
		</label>

		<div class="flex items-center justify-between">
			<button
				type="submit"
				class="mt-2 w-20 rounded-md bg-slate-300 p-2 shadow-md"
				disabled={fetching}>Add</button
			>
			<a href={resolve('/rss-feeds')} class="underline">View Saved Feeds</a>
		</div>
	</form>

	{#if podcast}
		<article class="h-2/12">
			<button onclick={() => handlePodcastClick(podcast)} class="cursor-pointer underline"
				>{podcast?.name}</button
			>
			<img src={podcast?.imageUrl} alt={`The podcast image for ${podcast?.name}`} class="h-full" />
		</article>
	{/if}
</dialog>

<style lang="scss">
</style>
