mod common;

use ::common::{auth_utils::decode_jwt, dto::UserTokenClaims};
use common::create_recipe;
use common_test::{
    auth::signup_random, make_service, request::RequestBuilder, response::ResponseExt,
    setup_logging,
};
use eyre::Result;
use recipe_likes::make_app;
use recipe_likes_models::dto::UserLikeStats;

#[tokio::test]
pub async fn test_like_success() -> Result<()> {
    setup_logging();

    let recipe = create_recipe().await?;

    let mut server = {
        let app = make_app().await?;
        make_service(app).await?
    };

    let token = signup_random().await?;
    let token_claims = decode_jwt::<UserTokenClaims>(&token)?.claims;
    let user_id = token_claims.sub.to_string();

    let uri = format!("/recipes/{}", recipe.id);

    // Create like
    let res = RequestBuilder::default()
        .uri(&uri)
        .bearer(&token)
        .post(&mut server)
        .await?;
    res.assert_ok().await?;

    // Check like
    let res = RequestBuilder::default()
        .uri(&uri)
        .query("user_id", &user_id)
        .get(&mut server)
        .await?;
    let res = res.assert_ok().await?;
    let like: UserLikeStats = res.json().await?;
    assert!(like.user_liked);

    // Delete like
    let res = RequestBuilder::default()
        .uri(&uri)
        .bearer(&token)
        .delete(&mut server)
        .await?;
    res.assert_ok().await?;

    // Check like
    let res = RequestBuilder::default()
        .uri(&uri)
        .query("user_id", &user_id)
        .get(&mut server)
        .await?;
    let res = res.assert_ok().await?;
    let like: UserLikeStats = res.json().await?;
    assert!(!like.user_liked);

    Ok(())
}
