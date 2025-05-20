use common_test::{make_service, request::RequestBuilder, response::ResponseExt, setup_logging};
use eyre::Result;
use recipes::make_app;
use recipes_models::entity::Recipe;

#[tokio::test]
pub async fn test_get_random_recipe_success() -> Result<()> {
    setup_logging();

    let mut server = {
        let app = make_app().await?;
        make_service(app).await?
    };

    let res = RequestBuilder::default()
        .uri("/recipes/random")
        .get(&mut server)
        .await?;
    let recipe: Recipe = res.json().await?;
    tracing::info!("Get a recipe: {:#?}", recipe);

    Ok(())
}
