mod handler;
mod repo;
mod router;
mod state;

use axum::Router;
use eyre::Result;

pub use router::make_router;
pub use state::RecipeLikesState;

pub async fn make_app() -> Result<Router> {
    let state = RecipeLikesState::try_new().await?;
    Ok(make_router().with_state(state))
}
