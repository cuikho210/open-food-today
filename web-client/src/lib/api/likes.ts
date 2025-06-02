import { CacheType } from '$lib/caches/types.d';
import type {} from '$lib/ts-binding/recipe_comments';
import type { UserLikeStats } from '$lib/ts-binding/recipe_likes';
import { buildRequest } from './http';

export function createLike(recipeId: number, token: string) {
	return buildRequest('/likes/recipes/' + recipeId)
		.bearerToken(token)
		.post();
}

export function deleteLike(recipeId: number, token: string) {
	return buildRequest('/likes/recipes/' + recipeId)
		.bearerToken(token)
		.delete();
}

function buildCheckLike(recipeId: number, userId: string) {
	return buildRequest('/likes/recipes/' + recipeId)
		.query({ user_id: userId })
		.setCacheType(CacheType.SessionOnly);
}

export function checkLike(recipeId: number, userId: string) {
	return buildCheckLike(recipeId, userId).get<UserLikeStats>();
}

export function deleteCheckLikeCache(recipeId: number, userId: string) {
	return buildCheckLike(recipeId, userId).deleteCache();
}
