import { getRandomRecipes } from '$lib/api/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const initRecipes = await getRandomRecipes(15);

	return {
		initRecipes
	};
};
