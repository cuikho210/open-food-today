use crate::{repo, RecipeCommentsState};
use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use common::{dto::UserTokenClaims, AppError};
use recipe_comments_models::{
    dto::{CreateCommentPayload, PaginationData},
    entity::RecipeComment,
};

pub async fn create_comment(
    State(state): State<RecipeCommentsState>,
    Extension(token_claims): Extension<UserTokenClaims>,
    Path(recipe_id): Path<i64>,
    Json(payload): Json<CreateCommentPayload>,
) -> Result<Json<RecipeComment>, AppError> {
    let parent = if let Some(id) = payload.reply_to {
        repo::get_recipe_comment_by_id(&state.db, id)
            .await
            .map_err(|e| AppError::InternalServer(format!("Failed to get parent comment: {}", e)))?
    } else {
        None
    };

    let (level, parent_id) = if let Some(parent) = parent {
        let max = 2;
        if parent.level < max {
            (parent.level + 1, Some(parent.id))
        } else {
            (max, parent.parent_id)
        }
    } else {
        (0, None)
    };

    let recipe_comment = repo::create_comment(
        &state.db,
        token_claims.sub,
        payload.reply_to,
        parent_id,
        recipe_id,
        level,
        payload.content,
    )
    .await
    .map_err(|e| AppError::InternalServer(format!("Failed to create comment: {}", e)))?;

    Ok(Json(recipe_comment))
}

pub async fn list_comments(
    State(state): State<RecipeCommentsState>,
    Path(recipe_id): Path<i64>,
    Query(params): Query<PaginationData>,
) -> Result<Json<Vec<RecipeComment>>, AppError> {
    let limit = params.limit.unwrap_or(20);
    let comments = repo::list_comments(&state.db, recipe_id, params.last_id, limit)
        .await
        .map_err(|e| AppError::InternalServer(format!("Failed to list comments: {}", e)))?;
    Ok(Json(comments))
}
