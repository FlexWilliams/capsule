import { VISUALIZER_VIDEO_ID } from '#lib/audio/audio.ts';
import { pictureInPictureState$$setPictureInPicture } from '../state/picture-in-picture.state.svelte';

export class PictureInPictureService {
	public static async togglePictureInPicture(): Promise<void> {
		if (document.pictureInPictureElement) {
			document.exitPictureInPicture();
		} else {
			const video = document.getElementById(VISUALIZER_VIDEO_ID) as HTMLVideoElement;
			if (!video) {
				return;
			}

			video.addEventListener('enterpictureinpicture', () => {
				PictureInPictureService.setPictureInPicture(true);
			});

			video.addEventListener('leavepictureinpicture', () => {
				PictureInPictureService.setPictureInPicture(false);
			});

			await video.play();

			const pipWindow = await video.requestPictureInPicture();

			pipWindow.addEventListener('resize', () => {
				console.log(`Picture in Picture resized: ${pipWindow.width}x${pipWindow.height}`);
			});

			PictureInPictureService.setPictureInPicture(true);
		}
	}

	public static setPictureInPicture(pip: boolean): void {
		pictureInPictureState$$setPictureInPicture(pip);
	}
}
