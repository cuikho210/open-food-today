use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "recipe_likes.d.ts")]
pub struct RecipeLikeRequest {
    pub recipe_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "recipe_likes.d.ts")]
pub struct UserIdRequest {
    pub user_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "recipe_likes.d.ts")]
pub struct UserLikeStats {
    pub user_id: Uuid,
    pub user_liked: bool,
}
