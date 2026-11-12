import { WssLogger } from '#lib/logging/logger.ts';
import {
	podcastState$$addEpisodeTranscriptions,
	podcastState$$resetEpisodeTranscription as podcastState$$resetEpisodeTranscriptionRequest,
	podcastState$$setDirectUrl,
	podcastState$$setEpisodeTranscriptionRequest,
	podcastState$$setSelectedPodcastTranscriptionUrl
} from '#lib/podcast/state/podcast.state.svelte.ts';
import { TranscriptionService } from '#lib/transcription/transcription-service.svelte.js';
import {
	TranscriptionStatus,
	type TranscriptionRequest,
	type TranscriptionResponse
} from '#lib/transcription/transcription.ts';
import { SPEECH_TO_TEXT_WSS_URL } from '$app/env/public';
import { webSocketState$$setClientId } from './state/websocket.state.svelte';

export class WebSocketService {
	public static clientId: string | null = null;

	private static webSocket: WebSocket | null = null;

	private static podcastUrl: string | null = null;

	private static onOpen(): void {
		WssLogger.log(`Connection opened!`);
	}

	private static onClose(): void {
		WssLogger.log(`Connection closed!`);
	}

	private static onError(error: Event): void {
		WssLogger.log(JSON.stringify(error));
	}

	private static onMessage(event: MessageEvent): void {
		try {
			const response = JSON.parse(event.data);

			if (typeof response === 'string') {
				return WssLogger.serverLog(`${response}`);
			}

			const { podcastUrl, directUrl, status, message, transcriptions } =
				response as TranscriptionResponse;

			if (status === TranscriptionStatus.Finished) {
				if (directUrl) {
					podcastState$$setDirectUrl(podcastUrl, directUrl);

					// TODO: review if this is the best way to handle this...
					podcastState$$setSelectedPodcastTranscriptionUrl(directUrl);
				}

				podcastState$$setEpisodeTranscriptionRequest(podcastUrl, response);

				if (transcriptions) {
					WssLogger.log(`New transcriptions received, adding to existing.`);

					podcastState$$addEpisodeTranscriptions(podcastUrl, transcriptions);

					TranscriptionService.emitTranscriptions(podcastUrl, transcriptions);
				}

				WssLogger.log(`Finished transcribing podcast.`);
			} else if (status === TranscriptionStatus.InvalidRequest) {
				podcastState$$resetEpisodeTranscriptionRequest(podcastUrl);

				WssLogger.log(`Error transcribing podcast - Invalid Request.\n${message}`);
			} else if (status === TranscriptionStatus.Failed) {
				WssLogger.log(`Error transcribing podcast - Error Occurred.\n${message}`);
			} else if (status === TranscriptionStatus.Processing) {
				if (directUrl) {
					podcastState$$setDirectUrl(podcastUrl, directUrl);

					// TODO: review if this is the best way to handle this...
					podcastState$$setSelectedPodcastTranscriptionUrl(directUrl);
				}

				if (transcriptions) {
					WssLogger.log(`New transcriptions received, adding to existing.`);

					podcastState$$addEpisodeTranscriptions(podcastUrl, transcriptions);

					TranscriptionService.emitTranscriptions(podcastUrl, transcriptions);
				}

				podcastState$$setEpisodeTranscriptionRequest(podcastUrl, response);
			} else {
				podcastState$$resetEpisodeTranscriptionRequest(podcastUrl);

				WssLogger.log(
					`Error transcribing podcast - Unknown Status Returned (${status}).\n${message}`
				);
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			const str = event.data as string;

			if (str.includes('Welcome to the WebSocket server')) {
				const tokens = str.split(' ');

				const clientId = tokens[tokens.length - 1];

				webSocketState$$setClientId(clientId);
			}

			return WssLogger.serverLog(`${event.data}`);
		}
	}

	public static async connect(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			try {
				if (!this.webSocket) {
					WssLogger.log(`Establishing wss connection...`);

					this.webSocket = new WebSocket(SPEECH_TO_TEXT_WSS_URL);

					this.webSocket.onopen = this.onOpen;
					this.webSocket.onclose = this.onClose;
					this.webSocket.onerror = this.onError;
					this.webSocket.onmessage = this.onMessage;
				}

				if (this.webSocket.readyState === WebSocket.OPEN) {
					resolve(true);
				} else {
					const retryInterval = 5000; // 5 seconds

					let retries = 0;

					const interval = setInterval(() => {
						retries++;

						if (retries > 6) {
							clearInterval(interval);

							const error = `Error establishing wss connection after 5 attempts.`;

							console.error(error);

							if (this.podcastUrl) {
								console.debug(`Clearing transcription request for user to retry.`);

								podcastState$$resetEpisodeTranscriptionRequest(this.podcastUrl);

								this.podcastUrl = null;
							}

							reject(error);
						}

						if (this.webSocket?.readyState === WebSocket.OPEN) {
							clearInterval(interval);

							resolve(true);
						}
					}, retryInterval);
				}
			} catch (e) {
				console.error(`Error establishing wss connection: ${e}`);

				reject(e);
			}
		});
	}

	public static async sendMessage(request: TranscriptionRequest): Promise<void> {
		if (!this.webSocket) {
			console.error(`Unable to send wss message, wss null!`);

			return;
		}

		const { podcastUrl } = request;

		this.podcastUrl = podcastUrl;

		if (this.webSocket.readyState === WebSocket.CLOSED) {
			this.webSocket = null;

			WssLogger.log(`Previous connection has terminated, reconnecting...`);

			const connected = await this.connect();

			if (!connected || !this.webSocket) {
				console.error(`Unable to send message, wss disconnected.`);

				return;
			}
		} else if (this.webSocket.readyState === WebSocket.CONNECTING) {
			const connected = await this.connect();

			if (!connected) {
				console.error(`Unable to send message, wss timed out making connection.`);

				return;
			}
		}

		WssLogger.log(`Sending request to transcribe podcast: ${request.podcastUrl}...`);

		const message = JSON.stringify(request);

		this.webSocket.send(message);
	}
}
