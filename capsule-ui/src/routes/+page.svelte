<script>
	import PodcastSearch from '#lib/search/components/PodcastSearch.svelte';
</script>

<div class="h-full w-full">
	<p class="w-full text-center text-3xl" aria-hidden="true">Capsule</p>

	<PodcastSearch />
</div>

<style lang="scss">
	p {
		/* TODO: put into tailwind **/
		color: #30374b;
		font-weight: 700;
		margin: 0;
		font-size: 1.75rem;
	}
</style>
