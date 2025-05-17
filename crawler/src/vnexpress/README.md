# VnExpress Recipe Crawler

This module crawls recipe data from VnExpress cooking section.

## Structure

- `recipes.json` - Contains a list of dish categories with their respective links
- `updateDishLinks.ts` - Script that updates the dish category links
- `recipeCrawler.ts` - Script that crawls recipe details from each dish page
- `data/` - Directory where crawled recipe data is stored
  - `recipes/` - Directory where individual recipe JSON files are stored

## Usage

To run the crawler:

```bash
# From the project root
npm run crawl-vnexpress
# or
bun run src/vnexpress/index.ts -u recipes
```

### Available Modes

You can specify the crawling mode with the `-m` or `--mode` flag:

```bash
# Crawl only recipe links
bun run src/vnexpress/index.ts -u recipes -m links

# Crawl only recipe details (requires links to be crawled first)
bun run src/vnexpress/index.ts -u recipes -m details

# Crawl both links and details (default)
bun run src/vnexpress/index.ts -u recipes -m all
```

### Updating Dish Categories

To update the dish category links:

```bash
bun run src/vnexpress/index.ts -u dish
```

## Output

The crawler will generate:
- Individual JSON files for each dish category in the `data/` directory
- A combined `all_recipes.json` file containing all recipe links grouped by dish category
- Individual recipe JSON files in the `data/recipes/` directory

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

### Recipe Details JSON
```json
{
  "id": "recipe-id",
  "title": "Recipe Title",
  "link": "https://vnexpress.net/doi-song/cooking/recipe-url",
  "description": "Recipe description",
  "author": "Author Name",
  "imageUrl": "https://image-url.jpg",
  "prepTime": "20 phút",
  "servingSize": "4-5 người",
  "calories": "706 kcal",
  "ingredients": [
    {
      "name": "Ingredient 1",
      "optional": false
    },
    {
      "name": "Ingredient 2 (tùy chọn)",
      "optional": true
    }
  ],
  "steps": [
    {
      "text": "Step 1 description",
      "image": "https://step1-image-url.jpg"
    }
  ],
  "notes": [
    "Note 1",
    "Note 2"
  ],
  "tags": [
    "Tag 1",
    "Tag 2"
  ],
  "createdAt": "2023-05-27T15:30:00.000Z"
}
```

## Notes

- The crawler includes a delay between requests to be respectful to the server
- Make sure to check the page structure if the crawler stops working, as website structure may change