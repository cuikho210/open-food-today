import type {
	CreateCommentPayload,
	PaginationData,
	RecipeComment
} from '$lib/ts-binding/recipe_comments';
import { buildRequest } from './http';

export function postComment(recipeId: number, payload: CreateCommentPayload) {
	return buildRequest('/comments/recipes/' + recipeId)
		.json(payload)
		.post<RecipeComment>();
}

export function listComments(recipeId: number, lastId?: number, limit?: number) {
	return buildRequest('/comments/recipes/' + recipeId)
		.query<PaginationData>({ limit: limit || null, last_id: lastId || null })
		.get<RecipeComment>();
}
