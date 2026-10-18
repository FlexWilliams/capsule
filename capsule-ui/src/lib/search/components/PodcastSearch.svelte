<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import PodcastSearchCard from '#lib/podcast/components/PodcastSearchCard.svelte';
	import type { Podcast } from '#lib/podcast/model/podcast.ts';
	import { debounceTime, Subject, Subscription, tap } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';

	const subscriptions: Subscription[] = [];

	const search$ = new Subject<string>();
	const search$$ = search$.asObservable();

	let searchResults: Podcast[] = $state([]);

	let hasSearched = $state(false);

	let searching = $state(false);

	function handleInput(e: Event): void {
		const value = (e.target as HTMLInputElement)?.value;

		search(value);
	}

	function search(value: string): void {
		hasSearched = true;

		searching = true;

		search$.next(value);
	}

	function handleSearch(e: Event): void {
		e.preventDefault();

		const form = new FormData(e.target as HTMLFormElement);

		const searchText = (form.get('search') as string | null) ?? '';

		search(searchText);
	}

	function listenForSearchChanges(): Subscription {
		return search$$
			.pipe(
				debounceTime(500),
				tap(async (text) => {
					console.log(`User searching for: ${text}`);

					try {
						const response = await fetch(`/api/podcasts?q=${text}`);

						if (response.ok) {
							searchResults = (await response.json()) as Podcast[];
						}
					} catch (e) {
						console.log(`Error occurred fetching podcats for query: ${text}\n${JSON.stringify(e)}`);
					} finally {
						searching = false;
					}
				})
			)
			.subscribe();
	}

	onMount(() => {
		subscriptions.push(listenForSearchChanges());
	});

	onDestroy(() => {
		subscriptions.forEach((sub) => sub.unsubscribe());
	});
</script>

<form name="search-podcasts" onsubmit={handleSearch} class="w-full p-4">
	<label class="flex flex-col">
		Search:
		<input
			name="search"
			type="search"
			class="h-10 rounded-md border border-slate-700 px-2"
			oninput={handleInput}
			autocomplete="off"
		/>
	</label>
</form>

<div class="h-10/12 max-h-10/12">
	{#if hasSearched && searching}
		<LoadingIndicator />
	{:else}
		<ul class="flex h-full flex-col overflow-auto px-4 text-center">
			{#each searchResults as podcast (podcast.name)}
				<li class="mb-4 shadow-md">
					<PodcastSearchCard {podcast} />
				</li>
			{:else}
				{#if hasSearched}
					<li>No podcast results</li>
				{:else}
					<li>Try searching for your favorite podcasts!</li>
				{/if}
			{/each}
		</ul>
	{/if}
</div>
