use std::env::{var, VarError};

pub fn get_database_url() -> Result<String, VarError> {
    var("DATABASE_URL")
}

pub fn get_jwt_secret() -> Result<String, VarError> {
    var("JWT_SECRET")
}
