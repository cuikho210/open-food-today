use recipe_comments_models::entity::RecipeComment;
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
) -> Result<Vec<RecipeComment>, sqlx::Error> {
    let comments = if let Some(last_id) = last_id {
        query_as::<_, RecipeComment>(
            "SELECT * FROM recipe_comments WHERE recipe_id = $1 AND id < $2 ORDER BY id DESC LIMIT $3"
        )
        .bind(recipe_id)
        .bind(last_id)
        .bind(limit)
        .fetch_all(db)
        .await?
    } else {
        query_as::<_, RecipeComment>(
            "SELECT * FROM recipe_comments WHERE recipe_id = $1 ORDER BY id DESC LIMIT $2",
        )
        .bind(recipe_id)
        .bind(limit)
        .fetch_all(db)
        .await?
    };
    Ok(comments)
}
