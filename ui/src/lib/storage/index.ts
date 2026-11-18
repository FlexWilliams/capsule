export class BaseObject {
	public id: string;

	constructor(id: string) {
		this.id = id;
	}
}

export enum StorageOperations {
	GET_BY_ID,
	GET_ALL
}

export * from './storage-service';

export * from './keys';
