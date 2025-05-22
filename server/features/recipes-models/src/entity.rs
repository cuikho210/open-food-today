use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "recipes.d.ts")]
pub struct Recipe {
    pub id: i64,
    pub title: String,
    pub link: Option<String>,
    pub description: Option<String>,
    pub author: Option<i64>,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
}
