<script>
	import AddViaRss from '#lib/rss/component/AddViaRss.svelte';
	import PodcastSearch from '#lib/search/components/PodcastSearch.svelte';
</script>

<div class="relative h-full w-full">
	<p class="w-full bg-background text-center text-3xl text-text" aria-hidden="true">Capsule</p>

	<PodcastSearch />

	<AddViaRss />
</div>

<style lang="scss">
	p {
		font-weight: 700;
		font-size: 1.75rem;
	}
</style>
