use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct CreateCommentPayload {
    pub reply_to: Option<i64>,
    pub content: String,
}
