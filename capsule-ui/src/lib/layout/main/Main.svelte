<script lang="ts">
	let { children } = $props();
</script>

<main class="m-h-10/12 m-auto flex h-10/12 w-9/12 flex-col items-center md:w-6/12">
	<noscript>
		<p class="mx-auto mt-2 flex w-100 rounded-md bg-amber-200 p-2 text-center">
			Unfortunately to run this app you need to enable JavaScript.
		</p>
	</noscript>

	<div class="h-full w-full">
		{@render children()}
	</div>
</main>
