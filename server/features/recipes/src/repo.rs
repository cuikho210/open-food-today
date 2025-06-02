use eyre::Result;
use recipes_models::entity::PublicRecipe;
use sqlx::PgPool;

pub async fn get_random_recipe(db: &PgPool) -> Result<Option<PublicRecipe>> {
    let recipe = sqlx::query_as::<_, PublicRecipe>(
        "SELECT 
            r.id,
            r.title,
            r.link,
            r.description,
            r.author,
            r.image_url,
            r.created_at,
            u.raw_user_meta_data->>'name' as author_name,
            u.raw_user_meta_data->>'avatar_url' as author_avatar_url,
            (SELECT COUNT(*) FROM recipe_likes rl WHERE rl.recipe_id = r.id) as likes_count,
            (SELECT COUNT(*) FROM recipe_comments rc WHERE rc.recipe_id = r.id) as comments_count
        FROM recipes r
        LEFT JOIN auth.users u ON r.author = u.id
        WHERE r.id >= (
            SELECT floor(random() * (
                (SELECT MAX(id) FROM recipes) - (SELECT MIN(id) FROM recipes) + 1
            )) + (SELECT MIN(id) FROM recipes)
        )
        ORDER BY r.id
        LIMIT 1",
    )
    .fetch_optional(db)
    .await?;

    Ok(recipe)
}

pub async fn get_recipe_by_id(db: &PgPool, id: i64) -> Result<Option<PublicRecipe>> {
    let recipe = sqlx::query_as::<_, PublicRecipe>(
        "SELECT 
            r.id,
            r.title,
            r.link,
            r.description,
            r.author,
            r.image_url,
            r.created_at,
            u.raw_user_meta_data->>'name' as author_name,
            u.raw_user_meta_data->>'avatar_url' as author_avatar_url,
            (SELECT COUNT(*) FROM recipe_likes rl WHERE rl.recipe_id = r.id) as likes_count,
            (SELECT COUNT(*) FROM recipe_comments rc WHERE rc.recipe_id = r.id) as comments_count
        FROM recipes r
        LEFT JOIN auth.users u ON r.author = u.id
        WHERE r.id = $1",
    )
    .bind(id)
    .fetch_optional(db)
    .await?;

    Ok(recipe)
}

pub async fn get_random_n_recipes(db: &PgPool, n: i64) -> Result<Vec<PublicRecipe>> {
    let recipes = sqlx::query_as::<_, PublicRecipe>(
        "SELECT 
            r.id,
            r.title,
            r.link,
            r.description,
            r.author,
            r.image_url,
            r.created_at,
            u.raw_user_meta_data->>'name' as author_name,
            u.raw_user_meta_data->>'avatar_url' as author_avatar_url,
            (SELECT COUNT(*) FROM recipe_likes rl WHERE rl.recipe_id = r.id) as likes_count,
            (SELECT COUNT(*) FROM recipe_comments rc WHERE rc.recipe_id = r.id) as comments_count
        FROM recipes r
        LEFT JOIN auth.users u ON r.author = u.id
        ORDER BY random()
        LIMIT $1",
    )
    .bind(n)
    .fetch_all(db)
    .await?;

    Ok(recipes)
}
