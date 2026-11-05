import defaultImage from '#lib/assets/images/pexels-mic-1867121_1280.jpg';
import type { Podcast, PodcastEpisode } from '#lib/podcast/model/podcast.ts';
import type { MediaSessionEventHandlers } from './media-session';

export class MediaSessionService {
	public static playMediaSessionAudio(): void {
		navigator.mediaSession.playbackState = 'playing';
	}

	public static pauseMediaSessionAudio(stop?: boolean): void {
		navigator.mediaSession.playbackState = stop ? 'none' : 'paused';
	}

	public static initMediaSession(handlers: MediaSessionEventHandlers): void {
		if (!('mediaSession' in navigator)) {
			console.error(`Unable to initialize the media session: mediaSession API unsupported.`);
			return;
		}

		navigator.mediaSession.setActionHandler('play', async () => {
			await handlers.play();
		});

		navigator.mediaSession.setActionHandler('pause', async () => {
			await handlers.pause();
		});

		navigator.mediaSession.setActionHandler('stop', async () => {
			await handlers.stop();
			this.pauseMediaSessionAudio(true);
		});

		navigator.mediaSession.setActionHandler('seekbackward', async () => {
			await handlers.seekBackward();
		});

		navigator.mediaSession.setActionHandler('seekforward', async () => {
			await handlers.seekForward();
		});

		navigator.mediaSession.setActionHandler('seekto', async (e) => {
			await handlers.seekTo(e?.seekTime);
		});

		navigator.mediaSession.setActionHandler('previoustrack', async () => {
			await handlers.previousTrack();
		});

		navigator.mediaSession.setActionHandler('nexttrack', async () => {
			await handlers.nextTrack();
		});

		navigator.mediaSession.setActionHandler('enterpictureinpicture', async (e) => {
			console.log(e);
		});
	}

	public static async updateMediaSession(
		podcast: Podcast,
		episode: PodcastEpisode,
		currentTime: number,
		duration: number
	): Promise<void> {
		if (!podcast) {
			console.warn(`Error: unable to update media session: no podcast provided!`);

			return;
		}

		const imageUrl = episode.image || podcast.imageUrl || defaultImage;

		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = 'playing';

			navigator.mediaSession.metadata = new MediaMetadata({
				title: episode.title,
				artist: podcast.name,
				album: podcast.name,
				artwork: [
					{
						src: imageUrl,
						sizes: '96x96',
						type: 'image/jpg'
					},
					{
						src: imageUrl,
						sizes: '128x128',
						type: 'image/jpg'
					},
					{
						src: imageUrl,
						sizes: '192x192',
						type: 'image/jpg'
					},
					{
						src: imageUrl,
						sizes: '256x256',
						type: 'image/jpg'
					},
					{
						src: imageUrl,
						sizes: '384x384',
						type: 'image/jpg'
					},
					{
						src: imageUrl,
						sizes: '512x512',
						type: 'image/jpg'
					}
				]
			});

			if ('setPositionState' in navigator.mediaSession) {
				navigator.mediaSession.setPositionState({
					duration,
					playbackRate: 1,
					position: currentTime
				});
			}
		}
	}
}
