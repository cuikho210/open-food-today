use common::env::get_database_url;
use eyre::{Context, Result};
use sqlx::{postgres::PgPoolOptions, query, query_as, PgPool};

pub async fn make_db() -> Result<PgPool> {
    let db_url = get_database_url()?;
    let db = PgPoolOptions::new()
        .connect(&db_url)
        .await
        .wrap_err(format!("could not connect to database {}", &db_url))?;
    Ok(db)
}

pub async fn migrate_up(db: &PgPool) -> Result<()> {
    sqlx::migrate!("./migrations").run(db).await?;
    Ok(())
}

pub async fn migrate_down(db: &PgPool) -> Result<()> {
    let tables: Vec<String> =
        query_as::<_, (String,)>("SELECT description FROM _sqlx_migrations ORDER BY version DESC")
            .fetch_all(db)
            .await?
            .into_iter()
            .map(|(val,)| val.replace(' ', "_"))
            .collect();
    for table in tables {
        query(&format!("DROP TABLE {} CASCADE", table))
            .execute(db)
            .await?;
    }
    query("DROP TABLE _sqlx_migrations CASCADE")
        .execute(db)
        .await?;
    Ok(())
}
