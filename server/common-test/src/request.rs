use axum::{
    body::Body,
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        request::Builder,
        HeaderName, HeaderValue, Response,
    },
    routing::RouterIntoService,
};
use eyre::Result;
use serde::Serialize;
use std::{collections::HashMap, fmt::Display};
use tower::Service;

pub struct RequestBuilder {
    pub builder: Builder,
    pub body: Body,
    pub query_map: HashMap<String, String>,
}
impl Default for RequestBuilder {
    fn default() -> Self {
        Self {
            builder: Builder::new(),
            body: Body::empty(),
            query_map: HashMap::new(),
        }
    }
}
impl RequestBuilder {
    pub fn uri(mut self, uri: &str) -> Self {
        self.builder = self.builder.uri(uri);
        self
    }

    pub fn bearer(mut self, bearer_value: impl Display) -> Self {
        self.builder = self
            .builder
            .header(AUTHORIZATION, format!("Bearer {}", bearer_value));
        self
    }

    pub fn header<K, V>(mut self, key: K, value: V) -> Self
    where
        K: TryInto<HeaderName>,
        <K as TryInto<HeaderName>>::Error: Into<axum::http::Error>,
        V: TryInto<HeaderValue>,
        <V as TryInto<HeaderValue>>::Error: Into<axum::http::Error>,
    {
        self.builder = self.builder.header(key, value);
        self
    }

    pub fn query(mut self, key: impl ToString, value: &str) -> Self {
        let value = urlencoding::encode(value).to_string();
        self.query_map.insert(key.to_string(), value);
        self
    }

    pub fn text(mut self, text: String) -> Self {
        self.body = Body::new(text);
        self
    }

    pub fn json(mut self, json: &impl Serialize) -> Result<Self> {
        self = self.header(CONTENT_TYPE, "application/json");
        let json_string = serde_json::to_string(json)?;
        self.body = Body::new(json_string);
        Ok(self)
    }

    pub async fn get(self, server: &mut RouterIntoService<Body>) -> Result<Response<Body>> {
        self.send("GET", server).await
    }

    pub async fn post(self, server: &mut RouterIntoService<Body>) -> Result<Response<Body>> {
        self.send("POST", server).await
    }

    pub async fn put(self, server: &mut RouterIntoService<Body>) -> Result<Response<Body>> {
        self.send("PUT", server).await
    }

    pub async fn delete(self, server: &mut RouterIntoService<Body>) -> Result<Response<Body>> {
        self.send("DELETE", server).await
    }

    async fn send(
        self,
        method: &str,
        server: &mut RouterIntoService<Body>,
    ) -> Result<Response<Body>> {
        let uri = {
            let query = self.build_query();
            let mut uri = self
                .builder
                .uri_ref()
                .map(|v| v.to_string())
                .unwrap_or("/".to_string());
            uri.push_str(&query);
            uri
        };
        let request = self.builder.method(method).uri(uri).body(self.body)?;
        let response = server.call(request).await?;
        Ok(response)
    }

    fn build_query(&self) -> String {
        if self.query_map.is_empty() {
            return String::new();
        }

        let mut result = "?".to_string();

        for (index, (key, value)) in self.query_map.iter().enumerate() {
            if index > 0 {
                result.push('&');
            }

            result.push_str(key);
            result.push('=');
            result.push_str(value);
        }

        result
    }
}
