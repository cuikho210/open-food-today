use crate::{
    auth_utils::decode_jwt,
    dto::{BearerToken, UserTokenClaims},
};
use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use tower_http::cors::{Any, CorsLayer};

pub fn cors() -> CorsLayer {
    CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any)
}

pub async fn authentication(
    mut request: Request,
    next: Next,
) -> Result<Response, (StatusCode, String)> {
    let headers = request.headers();

    let token = {
        let val = headers
            .get("Authorization")
            .ok_or((
                StatusCode::UNAUTHORIZED,
                "Missing authentication header".to_string(),
            ))?
            .to_str()
            .map_err(|err| (StatusCode::UNAUTHORIZED, err.to_string()))?;

        if let Some(stripped) = val.strip_prefix("Bearer ") {
            stripped
        } else {
            return Err((
                StatusCode::UNAUTHORIZED,
                "Only Bearer token authentication is supported".to_string(),
            ));
        }
    };

    let bearer_token = BearerToken(token.to_owned());
    let access_token_claims = decode_jwt::<UserTokenClaims>(token)
        .map_err(|err| (StatusCode::UNAUTHORIZED, err.to_string()))?
        .claims;
    let ext = request.extensions_mut();
    ext.insert(bearer_token);
    ext.insert(access_token_claims);

    let response = next.run(request).await;
    Ok(response)
}
