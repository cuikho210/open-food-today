import type { PublicRecipe } from '$lib/ts-binding/recipes';
import { buildRequest } from './http';

export function getRandomRecipe() {
	return buildRequest('/recipes/random').get<PublicRecipe | null>();
}

export function getRandomRecipes(length = 5) {
	return buildRequest('/recipes/random/' + length).get<PublicRecipe[]>();
}

export function getRecipeById(id: bigint | number) {
	return buildRequest('/recipes/' + id).get<PublicRecipe | null>();
}
