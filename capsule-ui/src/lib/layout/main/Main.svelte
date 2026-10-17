<script>
	import PodcastSearch from '#lib/search/components/PodcastSearch.svelte';
</script>

<main class="m-auto flex flex-col items-center">
	<noscript>
		<p class="mx-auto mt-2 flex w-100 rounded-md bg-amber-200 p-2 text-center">
			Unfortunately to run this app you need to enable JavaScript.
		</p>
	</noscript>

	<div class="w-full">
		<PodcastSearch />
	</div>
</main>

<style lang="scss">
	main {
		width: 80%;
		max-width: 80%;
	}
</style>
