use eyre::Result;
use tower_http::cors::{Any, CorsLayer};

pub fn cors() -> Result<CorsLayer> {
    Ok(CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any))
}
