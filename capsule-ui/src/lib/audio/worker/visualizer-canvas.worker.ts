import type { VisualizerCanvasWorkerRequest } from '../audio';

let animationFrameId = 0;

let canvas: OffscreenCanvas | null = null;

let drawing = false;

let pictureInPicture = false;

let text: string | undefined = undefined;

let fillStyle: string | undefined = undefined;

let imageUrl: string | undefined = undefined;

let podcastImage: ImageBitmap | null = null;

function log(message: string): void {
	console.log(`[VizCanvasWorker] ${message}`);
}

function logError(message: string): void {
	logError(`[VizCanvasWorker] ${message}`);
}

async function draw(): Promise<void> {
	if (!canvas) {
		logError('Unable to draw to visualizer canvas, element null.');

		return;
	}

	const context = canvas.getContext('2d');

	if (!context) {
		logError('Unable to draw to visualizer canvas, context null.');

		return;
	}

	context.clearRect(0, 0, canvas.width, canvas.height);

	if (podcastImage) {
		context.fillStyle = fillStyle || 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);

		const padding = 10;

		if (pictureInPicture) {
			context.drawImage(podcastImage, 0, 0, canvas.width, canvas.height);
		} else {
			context.drawImage(
				podcastImage,
				canvas.width / 8,
				padding,
				canvas.height / 4,
				canvas.height - padding
			);
		}

		const marqueeText = `${new Date().toISOString()}`; // text || `Now Playing...`;

		context.fillStyle = pictureInPicture ? 'red' : 'black'; // TODO: Get via theme...
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = `1rem "Cabin"`;
		context.fillText(marqueeText, canvas.width / 2 + canvas.height / 8, canvas.height / 2);
	} else {
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = 'black'; // TODO: Get via theme...
		context.font = `1.5rem 'Cabin'`;
		context.fillText(`Now Playing...`, canvas.width / 2, canvas.height / 2);
		context.textAlign = 'center';
	}

	animationFrameId = requestAnimationFrame(draw);
}

onmessage = async (e: MessageEvent<VisualizerCanvasWorkerRequest>) => {
	const {
		canvas: _canvas,
		draw: _draw,
		imageUrl: _imageUrl,
		pictureInPicture: _pictureInPicture,
		text: _text,
		fillStyle: _fillStyle,
		skipDraw
	} = e.data;

	pictureInPicture = _pictureInPicture;
	text = _text;
	fillStyle = _fillStyle;

	if (_imageUrl && _imageUrl !== imageUrl) {
		imageUrl = _imageUrl;

		const response = await fetch(imageUrl);
		if (response.ok) {
			const image = await createImageBitmap(await response.blob());

			podcastImage = image;
		}
	}

	if (skipDraw) {
		log(`Skipping canvas draw... `);

		return;
	}

	if (!_canvas) {
		if (!canvas) {
			logError(`Unable to draw, no canvas provided!`);

			return;
		}
	} else if (!canvas) {
		canvas = _canvas;
		log(`Canvas transferred to offscreen! `);
	}

	if (drawing && !draw) {
		cancelAnimationFrame(animationFrameId);

		drawing = false;

		log(`Canvas stopped drawing.`);

		return;
	}

	if (!drawing && _draw) {
		animationFrameId = requestAnimationFrame(draw);

		drawing = true;

		log(`Canvas drawing...`);

		return;
	}
};

export {};
