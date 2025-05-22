use axum::Router;
use common::middlewares::cors;
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

    let host = std::env::var("HOST").unwrap_or("127.0.0.1".to_owned());
    let port = std::env::var("PORT")
        .map(|v| v.parse::<u16>().unwrap())
        .unwrap_or(3310);
    let listener = tokio::net::TcpListener::bind(format!("{}:{}", host, port)).await?;

    tracing::info!("Starting server on http://{}", listener.local_addr()?);
    axum::serve(listener, app).await?;

    Ok(())
}

async fn make_app() -> Result<Router> {
    let recipes = recipes::make_app().await?;
    Ok(Router::new().nest("/recipes", recipes).layer(cors()))
}
