use axum::Router;
use eyre::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_file(true)
        .with_line_number(true)
        .with_max_level(tracing::Level::DEBUG)
        .init();
    color_eyre::install()?;

    let app = make_app().await?;
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3310").await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn make_app() -> Result<Router> {
    let recipes = recipes::make_app().await?;
    Ok(Router::new().nest("/recipes", recipes))
}
