use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct CreateCommentPayload {
    pub reply_to: Option<i64>,
    pub content: String,
}

#[derive(Deserialize, Serialize)]
pub struct PaginationData {
    pub limit: Option<i64>,
    pub last_id: Option<i64>,
}
