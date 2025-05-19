use common::env::get_database_url;
use eyre::{Context, Result};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_file(true)
        .with_line_number(true)
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let db = {
        let db_url = get_database_url()?;

        PgPoolOptions::new()
            .connect(&db_url)
            .await
            .wrap_err(format!("could not connect to database {}", &db_url))?
    };

    sqlx::migrate!("./migrations").run(&db).await?;

    Ok(())
}
