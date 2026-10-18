export interface PodcastEpisode {
	guid: string;
	title: string;
	subtitle?: string;
	description?: string;
	summary?: string;
	url?: string;
	link?: string;
	image?: string;
	duration?: number;
	isExplicit: boolean;
	publishDate?: string;
	contentLength?: number;
	episode?: number;
	tags: string[];
}

export interface Podcast {
	id: string;
	name: string;
	imageUrl: string;
	episodes?: PodcastEpisode[];
}
