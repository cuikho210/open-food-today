use eyre::Result;
use migrate::{make_db, migrate_down};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_file(true)
        .with_line_number(true)
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let db = make_db().await?;
    migrate_down(&db).await?;

    Ok(())
}
