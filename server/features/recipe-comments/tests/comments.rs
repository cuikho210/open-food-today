mod common;

use common::create_recipe;
use common_test::{make_service, request::RequestBuilder, response::ResponseExt, setup_logging};
use eyre::Result;
use recipe_comments::make_app;
use recipe_comments_models::{
    dto::CreateCommentPayload,
    entity::{PublicRecipeComment, RecipeComment},
};

#[tokio::test]
pub async fn test_post_comments_success() -> Result<()> {
    setup_logging();

    let recipe = create_recipe().await?;

    let mut server = {
        let app = make_app().await?;
        make_service(app).await?
    };

    let token = env!("TEST_ACCESS_TOKEN");
    let uri = format!("/recipes/{}", recipe.id);

    let cmt1 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: None,
                content: "Comment 1".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    let cmt2 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: Some(cmt1.id),
                content: "Comment 2".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    let cmt3 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: Some(cmt2.id),
                content: "Comment 3".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    let cmt4 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: Some(cmt3.id),
                content: "Comment 4".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    // Assert hierarchy based on handler.rs logic:
    // cmt1: top level comment
    assert_eq!(cmt1.level, 0);
    assert!(cmt1.parent_id.is_none());
    assert!(cmt1.reply_to.is_none());

    // cmt2: reply to cmt1, so level should be cmt1.level + 1
    assert_eq!(cmt2.level, 1);
    assert_eq!(cmt2.parent_id, Some(cmt1.id));
    assert_eq!(cmt2.reply_to, Some(cmt1.id));

    // cmt3: reply to cmt2, so level should be cmt2.level + 1 (capped at 2)
    assert_eq!(cmt3.level, 2);
    assert_eq!(cmt3.parent_id, Some(cmt2.id));
    assert_eq!(cmt3.reply_to, Some(cmt2.id));

    // cmt4: reply to cmt3 (already level 3) remains at level 2 and uses cmt3's parent_id
    assert_eq!(cmt4.level, 2);
    assert_eq!(cmt4.parent_id, Some(cmt2.id));
    assert_eq!(cmt4.reply_to, Some(cmt3.id));

    Ok(())
}

#[tokio::test]
pub async fn test_list_comments_success() -> Result<()> {
    setup_logging();

    let recipe = create_recipe().await?;
    let mut server = {
        let app = make_app().await?;
        make_service(app).await?
    };

    let token = env!("TEST_ACCESS_TOKEN");
    let uri = format!("/recipes/{}", recipe.id);

    // Create two comments for this recipe
    let _cmt1 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: None,
                content: "List Comment 1".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    let _cmt2 = {
        let res = RequestBuilder::default()
            .uri(&uri)
            .bearer(token)
            .json(&CreateCommentPayload {
                reply_to: None,
                content: "List Comment 2".to_string(),
            })?
            .post(&mut server)
            .await?;
        let res = res.assert_ok().await?;
        res.json::<RecipeComment>().await?
    };

    // List comments for the recipe
    let res = RequestBuilder::default()
        .uri(&uri)
        .bearer(token)
        .query("limit", "10")
        .get(&mut server)
        .await?;
    let res = res.assert_ok().await?;
    let comments = res.json::<Vec<PublicRecipeComment>>().await?;
    assert!(comments.len() >= 2);

    Ok(())
}
