import { CacheType } from '$lib/caches/types.d';
import type {
	CreateCommentPayload,
	PaginationData,
	PublicRecipeComment,
	RecipeComment
} from '$lib/ts-binding/recipe_comments';
import { buildRequest } from './http';

export function postComment(recipeId: number, payload: CreateCommentPayload, token: string) {
	return buildRequest('/comments/recipes/' + recipeId)
		.bearerToken(token)
		.json(payload)
		.post<RecipeComment>();
}

function buildListComments(recipeId: number, lastId?: number, limit?: number) {
	const builder = buildRequest('/comments/recipes/' + recipeId).query<PaginationData>({
		limit: limit || null,
		last_id: lastId || null
	});

	if (lastId) {
		builder.setCacheType(CacheType.ShortExpiration);
	} else {
		builder.setCacheType(CacheType.SessionOnly);
	}

	return builder;
}

export function listComments(recipeId: number, lastId?: number, limit?: number) {
	return buildListComments(recipeId, lastId, limit).get<PublicRecipeComment[]>();
}

export function deleteListCommentsCache(recipeId: number, lastId?: number, limit?: number) {
	return buildListComments(recipeId, lastId, limit).deleteCache();
}
