const colors = {
	default: `color: black; background-color: white; padding: 0.25rem;`,
	serviceWorker: `color: black; background-color: #4db6ac; padding: 0.25rem;`,
	worker: `color: black; background-color: #7986cb; padding: 0.25rem;`,
	storage: `color: black; background-color: #e6ee9c; padding: 0.25rem;`,
	wss: `color: black; background-color: #ff9800; padding: 0.25rem;`
};

class BaseLogger {
	public static log(message: string, color?: string): void {
		console.log(`%c${message}`, color || colors.default);
	}

	public static debug(message: string, color?: string): void {
		console.debug(`%c${message}`, color || colors.default);
	}

	public static info(message: string, color?: string): void {
		console.info(`%c${message}`, color || colors.default);
	}

	public static warn(message: string, color?: string): void {
		console.warn(`%c${message}`, color || colors.default);
	}

	public static error(message: string, color?: string): void {
		console.error(`%c${message}`, color || colors.default);
	}
}

export class Logger {
	public static log(message: string): void {
		BaseLogger.log(message);
	}

	public static debug(message: string): void {
		BaseLogger.debug(message);
	}

	public static info(message: string): void {
		BaseLogger.info(message);
	}

	public static warn(message: string): void {
		BaseLogger.warn(message);
	}

	public static error(message: string): void {
		BaseLogger.error(message);
	}
}

export class ServiceWorkerLogger {
	public static log(message: string): void {
		BaseLogger.log(message, colors.serviceWorker);
	}
}

export class WorkerLogger {
	public static log(message: string): void {
		BaseLogger.log(message, colors.worker);
	}

	public static debug(message: string): void {
		BaseLogger.debug(message, colors.worker);
	}

	public static info(message: string): void {
		BaseLogger.info(message, colors.worker);
	}

	public static warn(message: string): void {
		BaseLogger.warn(message, colors.worker);
	}

	public static error(message: string): void {
		BaseLogger.error(message, colors.worker);
	}
}

export class StorageLogger {
	public static log(message: string): void {
		BaseLogger.log(message, colors.storage);
	}

	public static error(message: string): void {
		BaseLogger.error(message, colors.storage);
	}
}

export class WssLogger {
	public static log(message: string): void {
		console.log(`%c[WSS] ${message}`, colors.wss);
	}

	public static serverLog(message: string): void {
		console.log(`%c[WSS Server]: ${message}`, colors.wss);
	}
}
