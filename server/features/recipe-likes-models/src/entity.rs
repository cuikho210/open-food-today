use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "recipe_likes.d.ts")]
pub struct RecipeLike {
    pub id: i64,
    pub recipe_id: i64,
    pub user_id: Uuid,
    pub created_at: DateTime<Utc>,
}
