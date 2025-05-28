use common::env::get_database_url;
use eyre::{Context, Result};
use sqlx::{postgres::PgPoolOptions, PgPool};

#[derive(Debug, Clone)]
pub struct RecipeCommentsState {
    pub db: PgPool,
}
impl RecipeCommentsState {
    pub async fn try_new() -> Result<Self> {
        let db = {
            let db_url = get_database_url()?;

            PgPoolOptions::new()
                .connect(&db_url)
                .await
                .wrap_err(format!("could not connect to database {}", &db_url))?
        };

        Ok(Self { db })
    }
}
