import type { I18nSchema } from './i18n';

export enum ApiErrorCode {
	CUSTOM_ERROR = 'CUSTOM_ERROR',
	INTERNAL_SERVER = 'INTERNAL_SERVER',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	VALIDATION = 'VALIDATION'
}

export class ApiError extends Error {
	constructor(
		public message: string,
		public errorCode: ApiErrorCode
	) {
		super(message);
	}

	toI18nMessage(t: I18nSchema): string {
		switch (this.errorCode) {
			case ApiErrorCode.CUSTOM_ERROR:
			case ApiErrorCode.INTERNAL_SERVER:
			case ApiErrorCode.FORBIDDEN:
			case ApiErrorCode.UNAUTHORIZED:
			case ApiErrorCode.VALIDATION:
				return this.message;
			default:
				return t.common.unexpectedError;
		}
	}
}
