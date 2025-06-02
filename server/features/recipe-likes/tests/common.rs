#![allow(dead_code)]

use eyre::Result;
use recipe_likes::RecipeLikesState;
use recipes_models::entity::Recipe;
use sqlx::query_as;

pub async fn create_recipe() -> Result<Recipe> {
    let state = RecipeLikesState::try_new().await?;
    let recipe = query_as::<_, Recipe>("INSERT INTO recipes (title) VALUES ($1) RETURNING *")
        .bind("ahihi")
        .fetch_one(&state.db)
        .await?;
    Ok(recipe)
}
