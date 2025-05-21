use eyre::Result;
use recipes_models::entity::Recipe;
use sqlx::PgPool;

pub async fn get_random_recipe(db: &PgPool) -> Result<Option<Recipe>> {
    let recipe = sqlx::query_as::<_, Recipe>(
        "SELECT *
        FROM recipes
        WHERE id >= (
            SELECT floor(random() * (
                (SELECT MAX(id) FROM recipes) - (SELECT MIN(id) FROM recipes) + 1
            )) + (SELECT MIN(id) FROM recipes)
        )
        ORDER BY id
        LIMIT 1",
    )
    .fetch_optional(db)
    .await?;

    Ok(recipe)
}

pub async fn get_random_n_recipes(db: &PgPool, n: i64) -> Result<Vec<Recipe>> {
    let recipes = sqlx::query_as::<_, Recipe>(
        "SELECT *
        FROM recipes
        ORDER BY random()
        LIMIT $1",
    )
    .bind(n)
    .fetch_all(db)
    .await?;

    Ok(recipes)
}
