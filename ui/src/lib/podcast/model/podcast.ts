export interface PodcastEpisode {
	guid: string;
	title: string;
	subtitle?: string;
	description?: string;
	summary?: string;
	url?: string;
	directUrl?: string;
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
	totalEpisodes?: number;
}

export interface PodcastMeta {
	name: string;
	id: string;
	rssUrl: string;
	imageUrl?: string;
	lastVisit?: string;

}

export interface EpisodeMarker {
	start: number;
	end?: number;
	comments?: string[];
}

export interface PodcastEpisodeActivity {
	podcastId:string;
	episodeId:string;
	timeLeftOffAt:number;
	lastListened?:string;
	listenCount:number;
	markers: EpisodeMarker[];
}
