use eyre::Result;
use recipes_models::entity::Recipe;
use sqlx::PgPool;

pub async fn get_random_recipe(db: &PgPool) -> Result<Option<Recipe>> {
    // Using ORDER BY RANDOM() to select a random recipe
    // This is not efficient for large tables but works well for a reasonable number of recipes
    let recipe = sqlx::query_as::<_, Recipe>(
        "SELECT id, title, link, description, author, image_url, created_at 
         FROM recipes 
         ORDER BY RANDOM() 
         LIMIT 1"
    )
    .fetch_optional(db)
    .await?;

    Ok(recipe)
}