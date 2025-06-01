use crate::{handler, RecipeLikesState};
use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};
use common::middlewares::authentication;
use tower_http::trace::TraceLayer;

fn make_private_router() -> Router<RecipeLikesState> {
    Router::new()
        .route("/recipes/{id}", post(handler::create_like))
        .route("/recipes/{id}", delete(handler::delete_like))
        .layer(middleware::from_fn(authentication))
}

pub fn make_router() -> Router<RecipeLikesState> {
    Router::new()
        .merge(make_private_router())
        .route("/recipes/{id}", get(handler::check_liked))
        .layer(TraceLayer::new_for_http())
}
