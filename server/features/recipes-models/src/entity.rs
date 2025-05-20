use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Recipe {
    pub id: i64,
    pub title: String,
    pub link: Option<String>,
    pub description: Option<String>,
    pub author: Option<i64>,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
}
