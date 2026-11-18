export const settingsStorageKey = 'settings';
export const myPodcastsStorageKey = 'my-podcasts';
export const myFavoritesStorageKey = 'my-favorites';

export function generatePodcastKey(podcastId: string): string {
	return `podcasts-${podcastId}`;
}

export function generatePodcastEpisodeActivityKey(podcastId: string, episodeId: string): string {
	return `podcasts-${podcastId}-episodes-${episodeId}`;
}

export function generateFavoritesId(podcastId: string, episodeId: string): string {
	return `${podcastId}-${episodeId}`;
}
