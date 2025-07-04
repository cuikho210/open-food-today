use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "recipes.d.ts")]
pub struct Recipe {
    pub id: i64,
    pub title: String,
    pub link: Option<String>,
    pub description: Option<String>,
    pub author: Option<Uuid>,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "recipes.d.ts")]
pub struct PublicRecipe {
    pub id: i64,
    pub title: String,
    pub link: Option<String>,
    pub description: Option<String>,
    pub author: Option<Uuid>,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub author_name: Option<String>,
    pub author_avatar_url: Option<String>,
    pub likes_count: Option<i64>,
    pub comments_count: Option<i64>,
}
