use eyre::{eyre, Result};
use jsonwebtoken::{Algorithm, DecodingKey, TokenData, Validation};
use serde::de::DeserializeOwned;

use crate::env::get_jwt_secret;

pub fn decode_jwt<T>(token: &str) -> Result<TokenData<T>>
where
    T: DeserializeOwned,
{
    let jwt_secret = get_jwt_secret()?;
    let decoding_key = DecodingKey::from_secret(jwt_secret.as_ref());
    jsonwebtoken::decode::<T>(token, &decoding_key, &Validation::new(Algorithm::HS256)).map_err(
        |e| {
            tracing::error!("{e}");
            eyre!("Failed to decode JWT")
        },
    )
}
