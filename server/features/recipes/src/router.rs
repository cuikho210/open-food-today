use crate::{handler, RecipesState};
use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;

pub fn make_router() -> Router<RecipesState> {
    Router::new()
        .route("/recipes/random", get(handler::get_random_recipe))
        .route("/recipes/random/{n}", get(handler::get_random_n_recipes))
        .layer(TraceLayer::new_for_http())
}
