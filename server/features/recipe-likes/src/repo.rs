use recipe_likes_models::{dto::UserLikeStats, entity::RecipeLike};
use sqlx::{query, query_as, types::Uuid, PgPool};

pub async fn create_like(
    db: &PgPool,
    recipe_id: i64,
    user_id: Uuid,
) -> Result<RecipeLike, sqlx::Error> {
    let like = query_as::<_, RecipeLike>(
        "INSERT INTO recipe_likes (recipe_id, user_id)
        VALUES ($1, $2)
        RETURNING *",
    )
    .bind(recipe_id)
    .bind(user_id)
    .fetch_one(db)
    .await?;

    Ok(like)
}

pub async fn delete_like(db: &PgPool, recipe_id: i64, user_id: Uuid) -> Result<u64, sqlx::Error> {
    let result = query("DELETE FROM recipe_likes WHERE recipe_id = $1 AND user_id = $2")
        .bind(recipe_id)
        .bind(user_id)
        .execute(db)
        .await?;

    Ok(result.rows_affected())
}

pub async fn check_liked(
    db: &PgPool,
    recipe_id: i64,
    user_id: Uuid,
) -> Result<UserLikeStats, sqlx::Error> {
    let user_liked = check_user_like_exists(db, recipe_id, user_id).await?;
    Ok(UserLikeStats {
        user_id,
        user_liked,
    })
}

pub async fn check_user_like_exists(
    db: &PgPool,
    recipe_id: i64,
    user_id: Uuid,
) -> Result<bool, sqlx::Error> {
    let count: i64 = query_as::<_, (i64,)>(
        "SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = $1 AND user_id = $2",
    )
    .bind(recipe_id)
    .bind(user_id)
    .fetch_one(db)
    .await?
    .0;

    Ok(count > 0)
}
