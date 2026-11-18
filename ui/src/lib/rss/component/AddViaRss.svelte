<script lang="ts">
	import close from '#lib/assets/icons/at-icons--cross.svg';
	import podcastFeed from '#lib/assets/icons/ic--round-podcasts.svg';
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import type { Podcast, PodcastMeta } from '#lib/podcast/model/podcast.ts';
	import { PodcastService } from '#lib/podcast/service/podcast.service.svelte.ts';
	import {
		podcastState,
		podcastState$$setLoadingPodcastViaRss
	} from '#lib/podcast/state/podcast.state.svelte.ts';
	import { VibrationService } from '#lib/vibration/vibration-service.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const popoverId = 'add-via-rss';

	let fetching = $derived(podcastState.loadingPodcastViaRss);

	let errorFetching = $state(false);

	let podcast: Podcast | null = $state(null);

	let rssUrl: string | null = $state(null);

	async function handleSubmit(e: Event): Promise<void> {
		e.preventDefault();

		VibrationService.vibrate();

		const form = e.target as HTMLFormElement;

		const formData = new FormData(form);

		rssUrl = formData.get('rss') as string;

		if (!rssUrl) {
			return;
		}

		podcastState$$setLoadingPodcastViaRss(true);

		const rssPodcast = await fetchPodcast(rssUrl);

		if (rssPodcast) {
			PodcastService.saveToMyPodcasts(rssPodcast);
		}

		podcast = rssPodcast;

		podcastState$$setLoadingPodcastViaRss(false);
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
			errorFetching = false;

			return (await response.json()) as Podcast;
		} else {
			errorFetching = true;

			return null;
		}
	}

	function handleAddViaRssButtonClick(): void {
		VibrationService.vibrate();

		showPopover();
	}

	function getPopover(): HTMLDialogElement | null {
		return document.getElementById(popoverId) as HTMLDialogElement;
	}

	function showPopover(): void {
		getPopover()?.showPopover();
	}

	async function handlePodcastClick(podcast: Podcast | null): Promise<void> {
		VibrationService.vibrate();

		if (!podcast) {
			return;
		}

		await savePodcastUrl(podcast);

		resetForm();

		dismissPopover();

		goto(resolve(`/podcasts/[id]`, { id: podcast?.id || 'EMPTY' }));
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

		const newPod: PodcastMeta = {
			name: podcast.name,
			id: podcast.id,
			rssUrl: podcast.rssUrl,
			imageUrl: podcast.imageUrl
		};

		const existing = localStorage.getItem('rss-podcasts');

		const podcasts: PodcastMeta[] = existing ? (JSON.parse(existing) as PodcastMeta[]) : [];

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

	function handleDialogClose(): void {
		VibrationService.vibrate();

		dismissPopover();
	}
</script>

<button
	class="absolute right-0 bottom-10 flex h-16 w-16 cursor-pointer items-center justify-center
	rounded-full border-0 bg-rss-button shadow-xl hover:bg-bg-highlight max-sm:h-12 max-sm:w-12"
	aria-label="Add via rss url"
	onclick={handleAddViaRssButtonClick}
>
	<img src={podcastFeed} alt="Rss icon" class="h-5/12" />
</button>

<dialog
	id={popoverId}
	popover
	class="relative m-auto h-6/12 w-9/12 rounded-md bg-rss-dialog p-8 text-text shadow-md max-sm:flex max-sm:flex-col max-sm:justify-around max-sm:gap-4"
>
	<button
		type="button"
		aria-label="Close"
		onclick={handleDialogClose}
		class="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-button text-xs text-button-text shadow-md"
	>
		<img src={close} alt="Close" class="h-4/12 w-4/12" /></button
	>
	<h3 class="h-3/12 text-center text-xl text-text">Add podcast via Rss Url?</h3>

	<form id="add-via-url" name="add-via-url" onsubmit={handleSubmit} class="h-5/12">
		<label class="flex flex-col">
			Rss Url:
			<input
				type="text"
				name="rss"
				autocomplete="off"
				class="h-8 rounded-md bg-input-bg px-1 text-input-text"
			/>
		</label>

		<div class="flex items-baseline justify-between">
			<button
				type="submit"
				class="mt-2 w-20 cursor-pointer rounded-md bg-dialog-button p-2 text-dialog-button-text shadow-md disabled:bg-button-bg-disabled disabled:text-button-text-disabled"
				disabled={fetching}>Add</button
			>
			<a href={resolve('/my-podcasts')} class="underline hover:text-text-highlight">Saved Feeds</a>
		</div>
	</form>

	<article class="flex h-3/12 items-center gap-2">
		{#if fetching}
			<LoadingIndicator />
		{:else}
			{#if podcast}
				<img
					src={podcast?.imageUrl}
					alt={`The podcast image for ${podcast?.name}`}
					class="h-full rounded-sm"
				/>

				<button
					onclick={() => handlePodcastClick(podcast)}
					class="max-w-8/12 flex-1 cursor-pointer overflow-hidden text-center underline"
					>{podcast?.name}</button
				>
			{:else if errorFetching}
				<p class="text-center">Error occurred fetching podcast. Retry or verify the URL.</p>
			{/if}
		{/if}
	</article>
</dialog>
