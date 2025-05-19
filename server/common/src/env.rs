use std::env::{var, VarError};

pub fn get_database_url() -> Result<String, VarError> {
    var("DATABASE_URL")
}
