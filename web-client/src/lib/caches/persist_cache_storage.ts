import { type IDBPDatabase, openDB } from 'idb';
import type { CacheResponse } from './types.d';

export class PersistCacheStorage {
	private dbKey = 'persist-cache-storage';
	private storeKey = 'persist-cache';
	private dbPromise: Promise<IDBPDatabase> | undefined;

	constructor() {
		this.createDb();
	}

	private async createDb() {
		if (!this.dbPromise) {
			this.dbPromise = openDB(this.dbKey, 1, {
				upgrade: (db) => {
					db.createObjectStore(this.storeKey);
				}
			});
		}

		return await this.dbPromise;
	}

	public async put(req: RequestInfo | URL, res: CacheResponse) {
		const db = await this.createDb();
		db.put(this.storeKey, res, req.toString());
	}

	public async match<T>(req: RequestInfo | URL): Promise<CacheResponse<T> | undefined> {
		const db = await this.createDb();
		return await db.get(this.storeKey, req.toString());
	}

	public async delete(req: RequestInfo | URL | IDBValidKey) {
		const db = await this.createDb();
		await db.delete(this.storeKey, req.toString());
	}

	public async clear() {
		const db = await this.createDb();
		db.clear(this.storeKey);
	}

	public async keys() {
		const db = await this.createDb();
		return await db.getAllKeys(this.storeKey);
	}
}
