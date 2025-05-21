use crate::{repo, RecipesState};
use axum::{
    extract::{Path, State},
    response::Json,
};
use common::AppError;
use eyre::Result;
use recipes_models::entity::Recipe;

pub async fn get_random_recipe(
    State(state): State<RecipesState>,
) -> Result<Json<Option<Recipe>>, AppError> {
    Ok(Json(repo::get_random_recipe(&state.db).await?))
}

pub async fn get_random_n_recipes(
    State(state): State<RecipesState>,
    Path(n): Path<i8>,
) -> Result<Json<Vec<Recipe>>, AppError> {
    if n <= 0 {
        return Ok(Json(vec![]));
    }
    let recipes = repo::get_random_n_recipes(&state.db, n as i64).await?;
    Ok(Json(recipes))
}
