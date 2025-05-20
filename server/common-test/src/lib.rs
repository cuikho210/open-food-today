pub mod request;
pub mod response;

use axum::{body::Body, routing::RouterIntoService, Router};
use eyre::Result;
use tower::ServiceExt;

pub fn setup_logging() {
    tracing_subscriber::fmt()
        .with_file(true)
        .with_line_number(true)
        .with_max_level(tracing::Level::DEBUG)
        .try_init()
        .ok();

    color_eyre::install().ok();
}

pub async fn make_service(app: Router) -> Result<RouterIntoService<Body>> {
    Ok(app.into_service::<Body>().ready_oneshot().await?)
}
