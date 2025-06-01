use std::env::{var, VarError};

pub fn get_database_url() -> Result<String, VarError> {
    var("DATABASE_URL")
}

pub fn get_jwt_secret() -> Result<String, VarError> {
    var("JWT_SECRET")
}

pub fn get_supabase_url() -> Result<String, VarError> {
    var("SUPABASE_URL")
}

pub fn get_supabase_anon_key() -> Result<String, VarError> {
    var("SUPABASE_ANON_KEY")
}
