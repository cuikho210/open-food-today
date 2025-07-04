use axum::response::Response;
use eyre::{eyre, Context, Result};
use http_body_util::BodyExt;
use serde::de;
use std::future::Future;

pub trait ResponseExt<T> {
    fn text(self) -> impl Future<Output = Result<String>> + Send;
    fn json<R>(self) -> impl Future<Output = Result<R>> + Send
    where
        R: for<'de> de::Deserialize<'de>;
    fn assert_ok(self) -> impl Future<Output = Result<T>> + Send;
}
impl ResponseExt<Response> for Response {
    async fn text(self) -> Result<String> {
        let bytes = self.into_body().collect().await?.to_bytes();
        Ok(String::from_utf8_lossy(&bytes).to_string())
    }

    async fn json<R>(self) -> Result<R>
    where
        R: for<'de> de::Deserialize<'de>,
    {
        let slice = self.into_body().collect().await?.to_bytes();
        serde_json::from_slice(&slice).wrap_err("Failed to parse response JSON")
    }

    async fn assert_ok(self) -> Result<Response> {
        if self.status().is_success() {
            return Ok(self);
        }

        let text = self.text().await?;
        Err(eyre!(text))
    }
}
