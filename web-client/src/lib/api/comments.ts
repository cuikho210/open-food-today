import type { RecipeComment } from '$lib/ts-binding/recipe_comments';
import { buildRequest } from './http';

export function postComment(recipeId: number) {
	return buildRequest('/comments/recipes/' + recipeId).get<RecipeComment | null>();
}
