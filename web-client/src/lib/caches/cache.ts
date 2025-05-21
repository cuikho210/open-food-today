import { browser } from '$app/environment';
import type { AxiosResponse } from 'axios';
import { PersistCacheStorage } from './persist_cache_storage';
import { SessionCacheStorage } from './session_cache_storage';
import { type CacheResponse, CacheType } from './types.d';

let cacheDefaultStorage: null | PersistCacheStorage = null;
let sessionCacheStorage: null | SessionCacheStorage = null;

export async function matchCacheByUri<T>(
	cacheType: CacheType,
	uri: string
): Promise<CacheResponse<T> | undefined> {
	if (cacheType === CacheType.NoCache) return undefined;

	if (cacheType === CacheType.SessionOnly) {
		const cache = await openSessionStorage();
		return cache.match<T>(uri);
	}

	const cache = await openDefaultStorage();
	const cached = await cache.match<T>(uri);
	if (!cached) return undefined;

	const cacheControl: string | undefined = cached.headers['cache-control'];
	const match = cacheControl ? cacheControl.match(/max-age=(\d+)/) : null;

	if (match) {
		const maxAge = parseInt(match[1], 10);
		const dateHeader: string | undefined = cached.headers['date'];
		if (dateHeader) {
			const date = new Date(dateHeader);
			const age = (Date.now() - date.getTime()) / 1000;

			if (age > maxAge) {
				await cache.delete(uri);
				return undefined;
			}
		}
	}

	return cached;
}

export async function putCache(cacheType: CacheType, uri: string, response: AxiosResponse) {
	if (cacheType === CacheType.NoCache) return;

	const cacheResponse = {
		headers: Object.fromEntries(Object.entries(response.headers)),
		data: response.data
	};

	if (cacheType === CacheType.SessionOnly) {
		const cache = await openSessionStorage();
		return await cache.put(uri, cacheResponse);
	}

	cacheResponse.headers['cache-control'] = `max-age=${cacheType}`;
	cacheResponse.headers['cache-type'] = cacheType.toString();

	const cache = await openDefaultStorage();
	await cache.put(uri, cacheResponse);
}

export async function clearCacheWithCondition(condition: (url: string) => boolean) {
	const cache = await openDefaultStorage();
	const keys = await cache.keys();

	await Promise.all(
		keys.map(async (key) => {
			console.log('key', key, key.toString());
			if (condition(key.toString())) {
				await cache.delete(key);
			}
		})
	);
}

export async function clearSessionCaches() {
	const cache = await openSessionStorage();
	cache.clear();
}

export async function clearPersistCaches() {
	const cache = await openDefaultStorage();
	cache.clear();
}

export async function clearAllCaches() {
	return Promise.all([clearPersistCaches(), clearSessionCaches()]);
}

async function openSessionStorage(): Promise<SessionCacheStorage> {
	if (!browser) throw new Error('Cache session storage is only available in browser environment');

	if (sessionCacheStorage) return sessionCacheStorage;
	sessionCacheStorage = new SessionCacheStorage();
	return sessionCacheStorage;
}

async function openDefaultStorage(): Promise<PersistCacheStorage> {
	if (!browser) throw new Error('Cache session storage is only available in browser environment');

	if (cacheDefaultStorage) return cacheDefaultStorage;
	cacheDefaultStorage = new PersistCacheStorage();
	return cacheDefaultStorage;
}
