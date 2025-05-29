use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "recipe_comments.d.ts")]
pub struct CreateCommentPayload {
    pub reply_to: Option<i64>,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "recipe_comments.d.ts")]
pub struct PaginationData {
    pub limit: Option<i64>,
    pub last_id: Option<i64>,
}
