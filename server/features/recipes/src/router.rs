use crate::{handler, RecipesState};
use axum::{routing::get, Router};

pub fn make_router() -> Router<RecipesState> {
    Router::new()
        .route("/recipes/random", get(handler::get_random_recipe))
}
