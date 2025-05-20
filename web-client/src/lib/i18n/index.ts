import { writable } from 'svelte/store';
import { messagesEnUS } from './en-US';

export type I18nSchema = typeof messagesEnUS;
export const messages = {
	'en-US': {
		name: 'English',
		messages: async () => messagesEnUS
	},
	'vi-VN': {
		name: 'Tiếng Việt',
		messages: async () => (await import('./vi-VN')).messagesViVN
	}
};
export type I18nLocale = keyof typeof messages;
export const t = writable<I18nSchema>(messagesEnUS);

const storeKey = 'app-locale';

export function init() {
	const storedLocaleKey = (localStorage.getItem(storeKey) as I18nLocale) || 'en-US';
	setLocale(storedLocaleKey);
}

export async function setLocale(localeCode: I18nLocale) {
	const newLocaleMessage = messages[localeCode].messages;
	if (!newLocaleMessage) return;

	t.set(await newLocaleMessage());
	document.documentElement.setAttribute('lang', localeCode.substring(0, 2));

	localStorage.setItem(storeKey, localeCode);
}
