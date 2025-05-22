import { CacheType } from '$lib/caches/types.d';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import { matchCacheByUri, putCache } from '../caches/cache';
import { ApiError, ApiErrorCode } from '../error';
import { API_BASE } from './config';
import type { ErrorResponse } from '$lib/ts-binding/common';

class Http {
	private base = API_BASE;
	private headers: Record<string, string> = {};
	private queryString: string | null = null;
	private body: XMLHttpRequestBodyInit | null = null;
	private method = 'GET';
	private cacheType = CacheType.NoCache;

	constructor(private uri: string) {}

	public setBase(base: string) {
		this.base = base;
		return this;
	}

	public setHeader(name: string, value: string) {
		this.headers[name] = value;
		return this;
	}

	public bearerToken(token: string) {
		this.setHeader('Authorization', 'Bearer ' + token);
		return this;
	}

	public setCacheType(cacheType: CacheType) {
		this.cacheType = cacheType;
		return this;
	}

	public query<T = Record<string, unknown>>(data: T) {
		const stringData: Record<string, string> = {};

		for (const key in data) {
			const value = data[key];
			if (value) {
				stringData[key] = String(value);
			}
		}

		this.queryString = '?' + new URLSearchParams(stringData).toString();
		return this;
	}

	public json<T = unknown>(data: T) {
		this.setHeader('Content-Type', 'application/json');
		this.body = JSON.stringify(data);
		return this;
	}

	public formData(data: FormData) {
		this.body = data;
		return this;
	}

	public async send<T>(retryCount = 0): Promise<T> {
		const url = makeUrl(this.base, this.uri, this.queryString || '');

		const cachedResponse = await matchCacheByUri<T>(this.cacheType, url);
		if (cachedResponse) {
			console.log('[httpRequest] matched a cache for', url, 'by CacheType', this.cacheType);
			return cachedResponse.data;
		}

		let res: AxiosResponse<T>;
		try {
			res = await axios(url, {
				method: this.method,
				headers: this.headers,
				data: this.body,
				withCredentials: true
			});
		} catch (_e) {
			const e = _e as AxiosError<ErrorResponse>;
			const resErr = e.response?.data;
			const apiError = new ApiError(
				resErr?.message || e.message,
				(resErr?.error_code as ApiErrorCode) || ApiErrorCode.CUSTOM_ERROR
			);

			if (resErr && retryCount == 0 && isAccessTokenExpired(resErr)) {
				this.renewAccessToken();
				return await this.send(++retryCount);
			}

			throw apiError;
		}

		putCache(this.cacheType, url, res);
		return res.data;
	}

	public get<T>() {
		this.method = 'GET';
		return this.send<T>();
	}

	public post<T>() {
		this.method = 'POST';
		return this.send<T>();
	}

	public patch<T>() {
		this.method = 'PATCH';
		return this.send<T>();
	}

	public put<T>() {
		this.method = 'PUT';
		return this.send<T>();
	}

	public delete<T>() {
		this.method = 'DELETE';
		return this.send<T>();
	}

	private async renewAccessToken() {
		// TODO: Implement renew access token
		this.bearerToken('');
	}
}

export function buildRequest(uri: string) {
	return new Http(uri);
}

function isAccessTokenExpired(error: ErrorResponse) {
	return error.error_code == ApiErrorCode.CUSTOM_ERROR && error.message === 'ExpiredSignature';
}

function makeUrl(origin: string, ...parts: string[]): string {
	const part0 =
		parts[0].startsWith('http://') || parts[0].startsWith('https://')
			? parts[0]
			: origin + parts[0];

	return part0 + parts.slice(1).join('');
}
