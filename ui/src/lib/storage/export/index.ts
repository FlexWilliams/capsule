import type { FavoriteEpisode, Podcast, PodcastMeta } from '#lib/podcast/model/podcast.ts';
import type { UserSettings } from '#lib/settings/model/index.ts';

export type DataExport = {
	myPodcasts: PodcastMeta[];
	podcasts: Podcast[];
	settings: UserSettings;
	myFavorites: FavoriteEpisode[];
};

export * from './state';
