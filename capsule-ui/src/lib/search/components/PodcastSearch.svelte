<script lang="ts">
	import LoadingIndicator from '#lib/loading/component/LoadingIndicator.svelte';
	import type { Podcast } from '#lib/podcast/model/podcast.ts';
	import { debounceTime, Subject, Subscription, tap } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';

	const subscriptions: Subscription[] = [];

	const search$ = new Subject<string>();
	const search$$ = search$.asObservable();

	let searchResults: Podcast[] = $state([]);

	let hasSearched = $state(false);

	let searching = $state(false);

	function handleSearch(e: Event): void {
		e.preventDefault();

		hasSearched = true;

		searching = true;

		const value = (e.target as HTMLInputElement)?.value;
		search$.next(value);
	}

	function listenForSearchChanges(): Subscription {
		return search$$
			.pipe(
				debounceTime(500),
				tap((text) => {
					console.log(`User searching for: ${text}`);

					setTimeout(() => {
						searching = false;
					}, 250);
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
			oninput={handleSearch}
			autocomplete="off"
		/>
	</label>
</form>

<div>
	{#if hasSearched && searching}
		<LoadingIndicator />
	{:else}
		<ul class="text-center">
			{#each searchResults as s (s.name)}
				<li>
					<p>{s.name}</p>
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
