<script lang="ts">
	import window from '#lib/assets/icons/at-icons--glass-pane.svg';
	import { onMount } from 'svelte';
	import { PictureInPictureService } from '../service/picture-in-picture.service.svelte';

	const buttonId = 'pip-button';

	onMount(() => {
		const button = document.getElementById(buttonId) as HTMLButtonElement;
		if (button) {
			if (document.pictureInPictureEnabled) {
				button.removeAttribute('disabled');
			} else {
				console.warn('PiP not supported. Check browser compatibility for details.');
			}
		}
	});
</script>

<div class="absolute top-1/2 right-8 flex items-center justify-around">
	<button
		id={buttonId}
		class="flex h-8 w-8 min-w-8 items-center justify-center rounded-full bg-pip-button p-1 shadow-md"
		type="button"
		aria-label="Open Picture in Picture?"
		disabled
		onclick={PictureInPictureService.togglePictureInPicture}
	>
		<img src={window} alt="Window icon" class="h-10/12 w-10/12" />
	</button>
</div>
