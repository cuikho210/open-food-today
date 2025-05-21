import type { CacheResponse } from './types.d';

export class SessionCacheStorage {
	public async put(req: RequestInfo | URL, res: CacheResponse) {
		sessionStorage.setItem(req.toString(), JSON.stringify(res));
	}

	public match<T>(req: RequestInfo | URL): CacheResponse<T> | undefined {
		const storedData = sessionStorage.getItem(req.toString());
		if (!storedData) return undefined;
		return JSON.parse(storedData);
	}

	public delete(req: RequestInfo | URL) {
		return sessionStorage.removeItem(req.toString());
	}

	public clear() {
		sessionStorage.clear();
	}
}
