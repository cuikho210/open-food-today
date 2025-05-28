use crate::RecipeCommentsState;
use axum::Router;
use tower_http::trace::TraceLayer;

pub fn make_router() -> Router<RecipeCommentsState> {
    Router::new().layer(TraceLayer::new_for_http())
}
