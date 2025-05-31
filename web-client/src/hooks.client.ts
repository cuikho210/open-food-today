import { init as initI18n } from '$lib/i18n/index';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = async () => {
	await initI18n();
};
