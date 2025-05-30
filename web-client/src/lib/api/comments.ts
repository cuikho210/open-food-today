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

export function listComments(recipeId: number, lastId?: number, limit?: number) {
	const builder = buildRequest('/comments/recipes/' + recipeId).query<PaginationData>({
		limit: limit || null,
		last_id: lastId || null
	});

	if (lastId) {
		builder.setCacheType(CacheType.ShortExpiration);
	}

	return builder.get<PublicRecipeComment[]>();
}
