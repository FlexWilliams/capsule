const colors = {
	serviceWorker: `color: black; background-color: #4db6ac; padding: 0.25rem;`
};

export class ServiceWorkerLogger {
	public static log(message: string): void {
		console.log(`%c${message}`, colors.serviceWorker);
	}
}
