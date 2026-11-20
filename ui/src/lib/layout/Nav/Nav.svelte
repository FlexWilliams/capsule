<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount, untrack } from 'svelte';
	import { layoutState, layoutState$$setNavMenuOpen } from '../layout-state.svelte';

	let navMenuOpen = $derived(layoutState.navMenuOpen);

	$effect(() => {
		if (navMenuOpen) {
			untrack(() => {
				const nav = document.getElementById('nav-menu') as HTMLElement;
				if (nav) {
					nav.focus();
				}
			});
		}
	});

	onMount(() => {
		const nav = document.getElementById('nav-menu') as HTMLElement;

		nav.onblur = () => {
			// setTimeout added due to race condition with menu button closing
			setTimeout(() => {
				layoutState$$setNavMenuOpen(false);
			}, 150);
		};
	});
</script>

<nav
	id="nav-menu"
	class="transition-width fixed top-0 left-0 z-4 h-full w-0 overflow-x-hidden bg-nav-bg shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] duration-500"
	class:w-60={navMenuOpen}
	class:p-4={navMenuOpen}
	tabindex="-1"
>
	<ul class:hidden={!navMenuOpen} class="text-text">
		<li class="h-16 text-center">
			<a href={resolve('/')} class="block cursor-pointer hover:text-text-highlight">Home</a>
		</li>
		<li class="h-16 text-center">
			<a href={resolve('/my-podcasts')} class="block cursor-pointer hover:text-text-highlight"
				>My Podcasts</a
			>
		</li>
		<li class="h-16 text-center">
			<a href={resolve('/my-favorites')} class="block cursor-pointer hover:text-text-highlight"
				>My Favorites</a
			>
		</li>
		<li class="h-16 text-center">
			<a href={resolve('/settings')} class="block cursor-pointer hover:text-text-highlight"
				>Settings</a
			>
		</li>
	</ul>
</nav>
