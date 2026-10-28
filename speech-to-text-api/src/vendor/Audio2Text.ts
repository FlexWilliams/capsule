/**
 * Customizing from original source: https://github.com/rn0x/Audio2TextJS
 * Many thanks!
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Audio2TextJSResult } from '../whisper';
import convertAudioFile from './convertAudioFile';

// TODO: put in config
const modelFile = `ggml-tiny.bin`;
const dirBin = `.bin`;

type WhisperTranscriptionResponse = {
	success: boolean;
	message: string;
	output?: any;
};

type Audio2TextJSOptions = {
	threads?: number;
	processors?: number;
	duration?: number;
	maxLen?: number;
	outputJson?: boolean;
	outputTxt?: boolean;
	outputCsv?: boolean;
	outputAll?: boolean;
	translate?: boolean;
};

/**
 * A class to run the Whisper tool for audio processing and transcription.
 */
export class Audio2TextJS {
	private defaultOptions: Audio2TextJSOptions = {};

	private options: Audio2TextJSOptions = {};

	private arch: string;

	private platform: string;

	// private __dirname: string;

	constructor(options: Audio2TextJSOptions = {}) {
		/**
		 * Default options for Audio2TextJS.
		 * @type {Object}
		 */
		this.defaultOptions = {
			threads: 4,
			processors: 1,
			duration: 0,
			maxLen: 0,
			outputJson: false,
			outputTxt: false,
			outputCsv: false
		};
		/**
		 * Merged options with defaults.
		 * @type {Object}
		 */
		this.options = { ...this.defaultOptions, ...options };
		/**
		 * Directory name of the current module.
		 * @type {string}
		 */
		// this.__dirname = path.dirname(fileURLToPath(import.meta.url));
		// this.__dirname = path.dirname(fileURLToPath(pathToFileURL(__filename).toString()));

		this.arch = os.arch();

		this.platform = os.platform();
	}

	/**
	 * Determines the path to the Whisper executable based on the operating system.
	 */
	getWhisperPath(): string | undefined {
		if (this.platform === 'linux' || this.platform === 'android') {
			if (this.arch === 'x64') {
				return path.join(__dirname, '../bin', 'whisper');
			} else if (['arm64', 'arm'].includes(this.arch)) {
				return path.join(dirBin, 'whisper-aarch64');
			}
		} else {
			throw new Error('Unsupported operating system.');
		}
	}

	/**
	 * Determines the path to the ffprobe executable based on the operating system.
	 */
	getFFprobePath(): string | undefined {
		const dirBin = path.join(__dirname, 'bin');
		if (this.platform === 'linux' || this.platform === 'android') {
			if (this.arch === 'x64') {
				return path.join(dirBin, 'linux', 'ffprobe');
			} else if (['arm64', 'arm'].includes(this.arch)) {
				return path.join(dirBin, 'linux', 'ffprobe-aarch64');
			}
		} else {
			throw new Error('Unsupported operating system.');
		}
	}

	/**
	 * Runs the Whisper tool with the specified input file, model file, and output file.
	 * @param {string} inputFile - Path to the input WAV file.
	 * @param {string} language - Spoken language ('auto' for auto-detect).
	 * @returns {Promise<{ success: boolean, message: string, output?: any }>} - A promise that resolves with success status, message, and optional output data upon completion.
	 */
	async runWhisper(inputFile: string, language: string): Promise<Audio2TextJSResult> {
		const {
			threads,
			processors,
			duration,
			maxLen,
			outputJson,
			outputTxt,
			outputCsv,
			outputAll,
			translate
		} = this.options;

		// Convert the audio file to a suitable format using the convertAudioFile function
		// If the conversion fails, return an object containing the error information
		const CWF = await convertAudioFile(inputFile);
		if (!CWF.success) return { success: false, message: CWF.message };

		const args = [
			`--threads`,
			`${threads}`,
			`--processors`,
			`${processors}`,
			`--duration`,
			`${duration}`,
			`--max-len`,
			`${maxLen}`,
			outputJson || outputAll ? '--output-json' : '',
			outputTxt || outputAll ? '--output-txt' : '',
			outputCsv || outputAll ? '--output-csv' : '',
			translate ? '--translate' : '',
			`--model`,
			`${path.join(__dirname, '../bin', modelFile)}`,
			`--language`,
			`${language}`,
			`--file`,
			`${CWF.output}`
		].filter(Boolean);

		const whisperPath = this.getWhisperPath();
		const subprocess = spawn(whisperPath || '', args, {
			env: {
				...process.env,
				LD_LIBRARY_PATH:
					this.platform === 'linux' || this.platform === 'android'
						? path.join(__dirname, 'bin', 'linux')
						: ''
			}
		});

		let stderr = '';

		return new Promise((resolve, reject) => {
			subprocess.stderr.on('data', (data) => {
				stderr += data.toString();
			});

			subprocess.on('close', async (code) => {
				if (code === 0) {
					const outputFiles = [];

					if (outputJson || outputAll) {
						try {
							const jsonContent = await fs.readFile(`${CWF.output}.json`, 'utf-8');
							outputFiles.push({
								type: 'json',
								data: JSON.parse(jsonContent),
								outputFile: `${CWF.output}.json`
							});
						} catch (error) {
							return resolve({
								success: false,
								message: `Failed to read or parse JSON output file: ${(error as WhisperTranscriptionResponse)?.message}`
							});
						}
					}

					if (outputTxt || outputAll) {
						try {
							const textContent = await fs.readFile(`${CWF.output}.txt`, 'utf-8');
							outputFiles.push({ type: 'txt', data: textContent, outputFile: `${CWF.output}.txt` });
						} catch (error) {
							return resolve({
								success: false,
								message: `Failed to read TXT output file: ${(error as WhisperTranscriptionResponse)?.message}`
							});
						}
					}

					if (outputCsv || outputAll) {
						try {
							const csvContent = await fs.readFile(`${CWF.output}.csv`, 'utf-8');
							outputFiles.push({ type: 'csv', data: csvContent, outputFile: `${CWF.output}.csv` });
						} catch (error) {
							return resolve({
								success: false,
								message: `Failed to read CSV output file: ${(error as WhisperTranscriptionResponse)?.message}`
							});
						}
					}

					resolve({
						success: true,
						message: `Whisper process completed successfully.`,
						output: outputFiles
					});
				} else {
					resolve({
						success: false,
						message: `Whisper process failed with code ${code}. stderr: ${stderr}`
					});
				}
			});

			subprocess.on('error', (err) => {
				reject(err);
			});
		});
	}

	/**
	 * Check if a video file contains audio streams.
	 */
	async checkAudioPresence(videoPath: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const ffprobePath = this.getFFprobePath();
			const args = [
				'-v',
				'error',
				'-select_streams',
				'a:0',
				'-show_entries',
				'stream=codec_type',
				'-of',
				'default=nokey=1:noprint_wrappers=1',
				videoPath
			];
			const ffprobe = spawn(ffprobePath || '', args);
			let hasAudio = false;

			ffprobe.stdout.on('data', (data) => {
				const codecType = data.toString().trim();
				if (codecType === 'audio') {
					hasAudio = true;
				}
			});

			ffprobe.on('close', (code) => {
				if (code === 0) {
					resolve(hasAudio);
				} else {
					reject(new Error(`ffprobe process exited with code ${code}`));
				}
			});

			ffprobe.on('error', (err) => {
				reject(err);
			});
		});
	}
}

export default Audio2TextJS;
