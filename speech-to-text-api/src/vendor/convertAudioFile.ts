/**
 * LICENSE MIT
 * Copyright (c) 2024 rn0x
 * github: https://github.com/rn0x
 * telegram: https://t.me/F93ii
 * repository: https://github.com/rn0x/Audio2TextJS
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const currentFileURL = pathToFileURL(__filename).toString();
// const __dirname = path.dirname(fileURLToPath(currentFileURL));

type AudioConversionResponse = {
	success: boolean;
	message: string;
	output?: string;
};

/**
 * Function to check if FFmpeg and ffprobe are installed and return their executable paths based on OS and architecture.
 * @returns {Object} Returns the paths to FFmpeg and ffprobe executables if installed, otherwise null.
 */
function getFFmpegPaths() {
	const dirBin = path.join(__dirname, '../../', 'bin');
	let ffmpegPath = null;
	let ffprobePath = null;
	console.log(`\n\n%cdirBin: ${dirBin}\n\n`, 'red');

	if (process.platform === 'linux' || process.platform === 'android') {
		if (process.arch === 'x64') {
			console.log(`\n\n%c x64 dirBin: ${dirBin}\n\n`, 'red');

			ffmpegPath = path.join(dirBin, 'ffmpeg');
			ffprobePath = path.join(dirBin, 'ffprobe');
		} else if (['arm64', 'arm'].includes(process.arch)) {
			console.log(`\n\n%c aarch dirBin: ${dirBin}\n\n`, 'red');
			ffmpegPath = path.join(dirBin, 'linux', 'ffmpeg-aarch64');
			ffprobePath = path.join(dirBin, 'linux', 'ffprobe-aarch64');
		} else {
			throw new Error('Unsupported architecture.');
		}
	} else {
		throw new Error('Unsupported operating system.');
	}

	if (fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)) {
		return { ffmpegPath, ffprobePath };
	}

	return { ffmpegPath: null, ffprobePath: null };
}

/**
 * Function to get the sample rate of an audio file using ffprobe.
 */
async function getSampleRate(ffprobePath: string, inputFilePath: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const subprocess = spawn(ffprobePath, [
			'-v',
			'error',
			'-show_entries',
			'stream=sample_rate',
			'-of',
			'default=noprint_wrappers=1:nokey=1',
			inputFilePath
		]);

		let stdout = '';
		let stderr = '';

		subprocess.stdout.on('data', (data) => {
			stdout += data.toString();
		});

		subprocess.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		subprocess.on('close', (code) => {
			if (code === 0) {
				resolve(parseInt(stdout.trim(), 10));
			} else {
				reject(new Error(`Failed to get sample rate: ${stderr.trim()}`));
			}
		});

		subprocess.on('error', (err) => {
			reject(err);
		});
	});
}

/**
 * Function to convert an audio file to WAV format.
 */
async function convertToWav(
	inputFilePath: string,
	outputFilePath: string,
	ffmpegPath: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		const subprocess = spawn(ffmpegPath, ['-y', '-i', inputFilePath, outputFilePath]);

		let stderr = '';

		subprocess.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		subprocess.on('close', (code) => {
			if (code === 0) {
				resolve(outputFilePath);
			} else {
				reject(new Error(`Failed to convert to WAV: ${stderr.trim()}`));
			}
		});

		subprocess.on('error', (err) => {
			reject(err);
		});
	});
}

/**
 * Function to convert an audio file to a desired sample rate and WAV format using FFmpeg.*/
async function convertAudioFile(
	inputFilePath: string,
	desiredSampleRate = 16000
): Promise<AudioConversionResponse> {
	try {
		let outputFilePath;
		const { ffmpegPath, ffprobePath } = getFFmpegPaths();
		if (!ffmpegPath || !ffprobePath) throw new Error('FFmpeg or ffprobe is not installed.');

		if (!fs.existsSync(inputFilePath)) {
			throw new Error(`Input file '${inputFilePath}' not found.`);
		}

		const ext = path.extname(inputFilePath).toLowerCase();
		const isWav = ext === '.wav';

		if (isWav) {
			const currentSampleRate = await getSampleRate(ffprobePath, inputFilePath);
			if (currentSampleRate === desiredSampleRate) {
				return {
					success: true,
					message: `Input file '${inputFilePath}' is already at the desired sample rate.`,
					output: inputFilePath
				};
			}
			outputFilePath = `${inputFilePath}.OUTPUT.wav`;
			return await convertSampleRate(inputFilePath, outputFilePath, desiredSampleRate, ffmpegPath);
		} else {
			const tempWavPath = `${inputFilePath}.TEMP.wav`;
			await convertToWav(inputFilePath, tempWavPath, ffmpegPath);
			const currentSampleRate = await getSampleRate(ffprobePath, tempWavPath);
			if (currentSampleRate === desiredSampleRate) {
				return {
					success: true,
					message: `Input file '${inputFilePath}' converted to WAV format with the desired sample rate.`,
					output: tempWavPath
				};
			}
			outputFilePath = `${inputFilePath}.OUTPUT.wav`;
			const result = await convertSampleRate(
				tempWavPath,
				outputFilePath,
				desiredSampleRate,
				ffmpegPath
			);
			fs.unlinkSync(tempWavPath);
			return result;
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to convert '${inputFilePath}' to the desired sample rate: ${(error as AudioConversionResponse)?.message}`
		};
	}
}

/**
 * Function to convert sample rate of a WAV file using FFmpeg.
 */
async function convertSampleRate(
	inputFilePath: string,
	outputFilePath: string,
	desiredSampleRate: number,
	ffmpegPath: string
): Promise<AudioConversionResponse> {
	return new Promise((resolve, reject) => {
		const subprocess = spawn(ffmpegPath, [
			'-y',
			'-i',
			inputFilePath,
			'-ar',
			`${desiredSampleRate}`,
			outputFilePath
		]);

		let stderr = '';

		subprocess.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		subprocess.on('close', (code) => {
			if (code === 0) {
				resolve({
					success: true,
					message: `File '${inputFilePath}' successfully converted to '${outputFilePath}' with sample rate ${desiredSampleRate} Hz.`,
					output: outputFilePath
				});
			} else {
				reject(
					new Error(
						`Failed to convert '${inputFilePath}' to the desired sample rate: ${stderr.trim()}`
					)
				);
			}
		});

		subprocess.on('error', (err) => {
			reject(err);
		});
	});
}

export default convertAudioFile;
