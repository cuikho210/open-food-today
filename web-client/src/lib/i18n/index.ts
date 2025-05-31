import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { type messagesEnUS } from './en-US';
import type { Cookies } from '@sveltejs/kit';

export type I18nSchema = typeof messagesEnUS;
export const messages = {
	'en-US': {
		name: 'English',
		messages: async () => (await import('./en-US')).messagesEnUS
	},
	'vi-VN': {
		name: 'Tiếng Việt',
		messages: async () => (await import('./vi-VN')).messagesViVN
	}
};
export type I18nLocale = keyof typeof messages;
export const t = writable<I18nSchema>();

const cookieName = 'app-locale';

export async function init(cookies?: Cookies) {
	let storedLocaleKey: I18nLocale = 'vi-VN';

	if (cookies) {
		const cookie = cookies.get(cookieName) as I18nLocale | undefined;
		if (cookie) {
			storedLocaleKey = cookie;
		}
	} else {
		const cookie = getClientCookie();
		if (cookie) {
			storedLocaleKey = cookie;
		}
	}

	await setLocale(storedLocaleKey);
}

export async function setLocale(localeCode: I18nLocale) {
	const newLocaleMessage = messages[localeCode].messages;
	if (!newLocaleMessage) return;

	t.set(await newLocaleMessage());

	if (browser) {
		document.documentElement.setAttribute('lang', localeCode.substring(0, 2));
	}

	setClientCookie(localeCode);
}

function setClientCookie(locale: I18nLocale) {
	if (!browser) return;
	document.cookie = cookieName + '=' + locale;
}

function getClientCookie(): I18nLocale | null {
	if (!browser)
		throw new Error('getClientCookie should only be called in the browser environment.');

	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(cookieName + '=')) {
			return cookie.substring(cookieName.length + 1) as I18nLocale;
		}
	}
	return null;
}
