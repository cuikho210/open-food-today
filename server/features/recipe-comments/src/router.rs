use crate::{handler, RecipeCommentsState};
use axum::{middleware, routing::post, Router};
use common::middlewares::authentication;
use tower_http::trace::TraceLayer;

fn make_private_router() -> Router<RecipeCommentsState> {
    Router::new()
        .route("/recipes/{id}", post(handler::create_comment))
        .layer(middleware::from_fn(authentication))
}

pub fn make_router() -> Router<RecipeCommentsState> {
    Router::new()
        .merge(make_private_router())
        .layer(TraceLayer::new_for_http())
}
