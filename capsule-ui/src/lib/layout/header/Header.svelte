<script>
	import AudioVisualizer from '#lib/audio/component/AudioVisualizer.svelte';
	import { resolve } from '$app/paths';
</script>

<header
	class="rounded-b-mdshadow-sm relative flex h-1/12 max-h-1/12 w-full items-center shadow-slate-300"
>
	<a href={resolve('/')} class="absolute top-0 left-0 z-2 h-full w-full">
		<h1 class="sr-only w-full text-center text-3xl">Capsule</h1>
	</a>
	<div class="absolute top-0 left-0 z-1 h-full w-full">
		<AudioVisualizer />
	</div>
</header>
