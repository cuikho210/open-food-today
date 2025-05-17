# VnExpress Recipe Crawler

This module crawls recipe data from VnExpress cooking section.

## Structure

- `recipes.json` - Contains a list of dish categories with their respective links
- `recipeCrawler.ts` - Script that crawls all recipe links from each dish category
- `data/` - Directory where crawled recipe data is stored

## Usage

To run the crawler:

```bash
# From the project root
npm run crawl-vnexpress
# or
bun run src/vnexpress/recipeCrawler.ts
```

## Output

The crawler will generate:
- Individual JSON files for each dish category in the `data/` directory
- A combined `all_recipes.json` file containing all recipe links grouped by dish category

## Data Structure

### recipes.json
```json
[
  {
    "name": "Dish Name",
    "link": "https://vnexpress.net/doi-song/cooking/mon-an/dish-slug"
  }
]
```

### Dish Category JSON (e.g., bun_ca.json)
```json
[
  {
    "title": "Recipe Title",
    "link": "https://vnexpress.net/doi-song/cooking/recipe-url"
  }
]
```

## Notes

- The crawler includes a delay between requests to be respectful to the server
- Make sure to check the page structure if the crawler stops working, as website structure may change