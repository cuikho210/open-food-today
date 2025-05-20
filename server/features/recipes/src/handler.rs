use crate::{repo, RecipesState};
use axum::{extract::State, response::Json};
use common::AppError;
use eyre::Result;
use recipes_models::entity::Recipe;

pub async fn get_random_recipe(
    State(state): State<RecipesState>,
) -> Result<Json<Option<Recipe>>, AppError> {
    Ok(Json(repo::get_random_recipe(&state.db).await?))
}
