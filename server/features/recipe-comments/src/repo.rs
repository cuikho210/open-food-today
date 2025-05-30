use recipe_comments_models::entity::{PublicRecipeComment, RecipeComment};
use sqlx::{query_as, types::Uuid, PgPool};

pub async fn create_comment(
    db: &PgPool,
    user_id: Uuid,
    reply_to: Option<i64>,
    parent_id: Option<i64>,
    recipe_id: i64,
    level: i16,
    content: String,
) -> Result<RecipeComment, sqlx::Error> {
    let comment = query_as::<_, RecipeComment>(
        "INSERT INTO recipe_comments (recipe_id, user_id, parent_id, reply_to, level, content)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *",
    )
    .bind(recipe_id)
    .bind(user_id)
    .bind(parent_id)
    .bind(reply_to)
    .bind(level)
    .bind(content)
    .fetch_one(db)
    .await?;

    Ok(comment)
}

pub async fn get_recipe_comment_by_id(
    db: &PgPool,
    recipe_comment_id: i64,
) -> Result<Option<RecipeComment>, sqlx::Error> {
    query_as::<_, RecipeComment>("SELECT * FROM recipe_comments WHERE id = $1")
        .bind(recipe_comment_id)
        .fetch_optional(db)
        .await
}

pub async fn list_comments(
    db: &PgPool,
    recipe_id: i64,
    last_id: Option<i64>,
    limit: i64,
) -> Result<Vec<PublicRecipeComment>, sqlx::Error> {
    let last_id = last_id.unwrap_or(0);
    let comments = query_as::<_, PublicRecipeComment>(
        "SELECT rc.*, 
            u.raw_user_meta_data->>'name' as user_name, 
            u.raw_user_meta_data->>'avatar_url' as user_avatar_url
        FROM recipe_comments rc
        LEFT JOIN auth.users u ON u.id = rc.user_id
        WHERE rc.recipe_id = $1 AND rc.id > $2
        ORDER BY rc.id ASC
        LIMIT $3",
    )
    .bind(recipe_id)
    .bind(last_id)
    .bind(limit)
    .fetch_all(db)
    .await?;
    Ok(comments)
}
