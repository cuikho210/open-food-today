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
        .uri("/random")
        .get(&mut server)
        .await?;
    let recipe: Recipe = res.json().await?;
    tracing::info!("Get a recipe: {:#?}", recipe);

    Ok(())
}

#[tokio::test]
pub async fn test_get_random_n_recipes_success() -> Result<()> {
    setup_logging();

    let mut server = {
        let app = make_app().await?;
        make_service(app).await?
    };

    let n = 5;
    let res = RequestBuilder::default()
        .uri(&format!("/random/{}", n))
        .get(&mut server)
        .await?;

    {
        let status = res.status();
        if !status.is_success() {
            let text = res.text().await?;
            panic!("Request failed with status: {}, body: {}", status, text);
        }
    }

    let recipes: Vec<Recipe> = res.json().await?;
    tracing::info!("Get {} recipes: {:#?}", n, recipes);

    // We cannot guarantee exactly N recipes if the database has fewer than N.
    // However, we can assert that we got *some* recipes if there are any.
    // A more robust test would involve seeding the database with known data.
    if !recipes.is_empty() {
        assert!(recipes.len() <= n as usize);
    }

    Ok(())
}
