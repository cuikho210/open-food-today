use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "recipe_comments.d.ts")]
pub struct RecipeComment {
    pub id: i64,
    pub recipe_id: i64,
    pub user_id: Uuid,
    pub parent_id: Option<i64>,
    pub level: i16,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
