use axum::response::Response;
use eyre::{Context, Result};
use http_body_util::BodyExt;
use serde::de;
use std::future::Future;

pub trait ResponseExt {
    fn text(self) -> impl Future<Output = Result<String>> + Send;
    fn json<T>(self) -> impl Future<Output = Result<T>> + Send
    where
        T: for<'de> de::Deserialize<'de>;
}
impl ResponseExt for Response {
    async fn text(self) -> Result<String> {
        let bytes = self.into_body().collect().await?.to_bytes();
        Ok(String::from_utf8_lossy(&bytes).to_string())
    }

    async fn json<T>(self) -> Result<T>
    where
        T: for<'de> de::Deserialize<'de>,
    {
        let slice = self.into_body().collect().await?.to_bytes();
        serde_json::from_slice(&slice).wrap_err("Failed to parse response JSON")
    }
}
