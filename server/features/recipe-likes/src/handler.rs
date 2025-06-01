use crate::{repo, RecipeLikesState};
use axum::{
    extract::{Path, Query, State},
    response::Json,
    Extension,
};
use common::{dto::UserTokenClaims, AppError};
use recipe_likes_models::dto::{UserIdRequest, UserLikeStats};

pub async fn create_like(
    State(state): State<RecipeLikesState>,
    Extension(token_claims): Extension<UserTokenClaims>,
    Path(recipe_id): Path<i64>,
) -> Result<(), AppError> {
    // Check if like already exists
    match repo::check_user_like_exists(&state.db, recipe_id, token_claims.sub).await {
        Ok(true) => return Ok(()),
        Ok(false) => {}
        Err(err) => return Err(AppError::InternalServer(err.to_string())),
    }

    match repo::create_like(&state.db, recipe_id, token_claims.sub).await {
        Ok(_) => Ok(()),
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => Err(
            AppError::BadRequest("Recipe already liked by user".to_owned()),
        ),
        Err(err) => Err(AppError::InternalServer(err.to_string())),
    }
}

pub async fn delete_like(
    State(state): State<RecipeLikesState>,
    Extension(token_claims): Extension<UserTokenClaims>,
    Path(recipe_id): Path<i64>,
) -> Result<(), AppError> {
    match repo::delete_like(&state.db, recipe_id, token_claims.sub).await {
        Ok(rows_affected) => {
            if rows_affected > 0 {
                Ok(())
            } else {
                Err(AppError::BadRequest("Like not found".to_string()))
            }
        }
        Err(err) => Err(AppError::InternalServer(err.to_string())),
    }
}

pub async fn check_liked(
    State(state): State<RecipeLikesState>,
    Path(recipe_id): Path<i64>,
    Query(UserIdRequest { user_id }): Query<UserIdRequest>,
) -> Result<Json<UserLikeStats>, AppError> {
    let stats = repo::check_liked(&state.db, recipe_id, user_id)
        .await
        .map_err(|err| AppError::InternalServer(err.to_string()))?;
    Ok(Json(stats))
}
