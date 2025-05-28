use crate::RecipeCommentsState;
use axum::{middleware, Router};
use common::middlewares::authentication;
use tower_http::trace::TraceLayer;

fn make_private_router() -> Router<RecipeCommentsState> {
    Router::new().layer(middleware::from_fn(authentication))
}

pub fn make_router() -> Router<RecipeCommentsState> {
    Router::new()
        .merge(make_private_router())
        .layer(TraceLayer::new_for_http())
}
