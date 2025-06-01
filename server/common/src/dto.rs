use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct BearerToken(pub String);

#[derive(Debug, Clone, Serialize, Deserialize, TS, Hash, PartialEq, Eq)]
#[ts(export, export_to = "common.d.ts")]
pub struct UserTokenClaims {
    pub iss: Option<String>,
    pub sub: Uuid,
    pub aud: String,
    pub exp: i64,
    pub iat: i64,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub role: String,
    pub aal: Option<String>,
    pub session_id: String,
    pub is_anonymous: bool,
}
