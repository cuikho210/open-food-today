use crate::{handler, RecipesState};
use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;

pub fn make_router() -> Router<RecipesState> {
    Router::new()
        .route("/random", get(handler::get_random_recipe))
        .route("/random/{n}", get(handler::get_random_n_recipes))
        .route("/{id}", get(handler::get_recipe_by_id))
        .layer(TraceLayer::new_for_http())
}
