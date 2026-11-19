export const settingsStorageKey = 'settings';
export const myPodcastsStorageKey = 'my-podcasts';

export function generatePodcastKey(podcastId: string): string {
	return `podcasts-${podcastId}`;
}

export function generatePodcastEpisodeActivityKey(podcastId: string, episodeId: string): string {
	return `podcasts-${podcastId}-episodes-${episodeId}`;
}
