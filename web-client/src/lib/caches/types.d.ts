export enum CacheType {
	NoCache,
	SessionOnly,
	ShortExpiration = 60 * 60, // 60 minutes
	LongExpiration = 60 * 60 * 48 // 48 hours
}

export interface CacheResponse<T = unknown> {
	headers: Record<string, string>;
	data: T;
}
