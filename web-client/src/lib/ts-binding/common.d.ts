// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type AppError =
	| { Custom: [string, number] }
	| { InternalServer: string }
	| { Unauthorized: string }
	| { Forbidden: string }
	| { Validation: string }
	| { BadRequest: string };

export type ErrorResponse = { error_code: string; message: string };

export type UserTokenClaims = {
	iss: string | null;
	sub: string;
	aud: string;
	exp: number;
	iat: number;
	email: string | null;
	phone: string | null;
	role: string;
	aal: string | null;
	session_id: string;
	is_anonymous: boolean;
};
