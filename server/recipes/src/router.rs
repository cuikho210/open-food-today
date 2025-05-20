use crate::RecipesState;
use axum::Router;

pub fn make_router() -> Router<RecipesState> {
    Router::new()
}
