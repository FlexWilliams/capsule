export const VISUALIZER_CANVAS_ID = 'visualizer-canvas';
export const VISUALIZER_VIDEO_ID = 'visualizer-video';

export interface VisualizerCanvasWorkerResponse {
	loading?: boolean;
}

export interface VisualizerCanvasWorkerRequest {
	canvas?: OffscreenCanvas;
	draw: boolean;
	skipDraw?: boolean;
	pictureInPicture: boolean;
	text?: string;
	fillStyle?: string;
	imageUrl?: string;
}
