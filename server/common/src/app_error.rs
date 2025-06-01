use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "common.d.ts")]
pub struct ErrorResponse {
    pub error_code: String,
    pub message: String,
}

#[derive(Error, Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "common.d.ts")]
pub enum AppError {
    #[error("{0}")]
    Custom(String, u16),

    #[error("{0}")]
    InternalServer(String),

    #[error("{0}")]
    Unauthorized(String),

    #[error("{0}")]
    Forbidden(String),

    #[error("{0}")]
    Validation(String),

    #[error("{0}")]
    BadRequest(String),
}
impl AppError {
    pub fn to_error_code(&self) -> String {
        match self {
            Self::Custom(_, _) => "CUSTOM_ERROR".to_string(),
            Self::InternalServer(_) => "INTERNAL_SERVER".to_string(),
            Self::Unauthorized(_) => "UNAUTHORIZED".to_string(),
            Self::Forbidden(_) => "FORBIDDEN".to_string(),
            Self::Validation(_) => "VALIDATION".to_string(),
            Self::BadRequest(_) => "BAD_REQUEST".to_string(),
        }
    }

    pub fn to_status_code(&self) -> StatusCode {
        match self {
            Self::Custom(_, status) => {
                StatusCode::from_u16(*status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
            }
            Self::InternalServer(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            Self::Forbidden(_) => StatusCode::FORBIDDEN,
            _ => StatusCode::BAD_REQUEST,
        }
    }

    pub fn to_error_response(&self) -> ErrorResponse {
        ErrorResponse {
            error_code: self.to_error_code(),
            message: self.to_string(),
        }
    }
}
impl From<eyre::Report> for AppError {
    fn from(err: eyre::Report) -> Self {
        Self::Custom(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16())
    }
}
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.to_status_code();
        let response = self.to_error_response();
        (status, Json(response)).into_response()
    }
}
