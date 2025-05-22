import type { Recipe } from '$lib/ts-binding/recipes';
import { buildRequest } from './http';

export function getRandomRecipe() {
	return buildRequest('/recipes/random').get<Recipe | null>();
}

export function getRandomRecipes(length = 5) {
	return buildRequest('/recipes/random/' + length).get<Recipe[]>();
}

export function getRecipeById(id: bigint | number) {
	return buildRequest('/recipes/' + id).get<Recipe | null>();
}
