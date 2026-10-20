export interface PodcastEpisode {
	guid: string;
	title: string;
	subtitle?: string;
	description?: string;
	summary?: string;
	url?: string;
	image?: string;
	duration?: number;
	isExplicit: boolean;
	publishDate?: string;
	contentLength?: number;
	contentLengthInMb?: number;
	episode?: number;
	tags: string[];
}

export interface Podcast {
	id: string;
	name: string;
	imageUrl?: string;
	rssUrl: string;
	episodes?: PodcastEpisode[];
}

export interface PodcastRssMeta {
	name: string;
	id: string;
	rssUrl: string;
	imageUrl?: string;
}
