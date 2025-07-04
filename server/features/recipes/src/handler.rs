use crate::{repo, RecipesState};
use axum::{
    extract::{Path, State},
    response::Json,
};
use common::AppError;
use eyre::Result;
use recipes_models::entity::PublicRecipe;

pub async fn get_random_recipe(
    State(state): State<RecipesState>,
) -> Result<Json<Option<PublicRecipe>>, AppError> {
    Ok(Json(repo::get_random_recipe(&state.db).await?))
}

pub async fn get_random_n_recipes(
    State(state): State<RecipesState>,
    Path(n): Path<i8>,
) -> Result<Json<Vec<PublicRecipe>>, AppError> {
    if n <= 0 {
        return Ok(Json(vec![]));
    }
    let recipes = repo::get_random_n_recipes(&state.db, n as i64).await?;
    Ok(Json(recipes))
}

pub async fn get_recipe_by_id(
    State(state): State<RecipesState>,
    Path(id): Path<i64>,
) -> Result<Json<Option<PublicRecipe>>, AppError> {
    Ok(Json(repo::get_recipe_by_id(&state.db, id).await?))
}
