const colors = {
	serviceWorker: `color: black; background-color: #4db6ac; padding: 0.25rem;`,
	wss: `color: black; background-color: #ff9800; padding: 0.25rem;`
};

export class ServiceWorkerLogger {
	public static log(message: string): void {
		console.log(`%c${message}`, colors.serviceWorker);
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
