use common::env::{get_supabase_anon_key, get_supabase_url};
use eyre::{ContextCompat, Result};
use serde::Serialize;
use serde_json::{json, Value};

pub async fn signup(email: impl Serialize, password: impl Serialize) -> Result<String> {
    let host = get_supabase_url()?;
    let token = get_supabase_anon_key()?;
    let client = reqwest::Client::new();
    let res = client
        .post(&format!("{}/auth/v1/signup", host))
        .header("apikey", token)
        .json(&json!({
            "email": email,
            "password": password
        }))
        .send()
        .await?;
    let mut value: Value = res.json().await?;
    let access_token = value["access_token"]
        .take()
        .as_str()
        .wrap_err("access_token is empty")?
        .to_string();
    Ok(access_token)
}

pub async fn signup_random() -> Result<String> {
    let email = gen_random_email();
    signup(email, "7!!Password@ahihi_do_ngok").await
}

pub fn gen_random_email() -> String {
    format!("user{}@example.com", rand::random::<u32>())
}
