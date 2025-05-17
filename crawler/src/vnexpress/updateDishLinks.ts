import axios from "axios";
import { JSDOM } from "jsdom";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the recipes.json file
const recipesJsonPath = path.join(__dirname, "data", "recipes.json");

interface DishInfo {
  name: string;
  link: string;
}

/**
 * Fetches the HTML content from a URL
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return "";
  }
}

/**
 * Extracts all dish category links from the main cooking page and subpages if necessary
 */
async function getDishCategoryLinks(
  baseUrl = "https://vnexpress.net/doi-song/cooking/mon-an",
  allDishes = new Map<string, string>(),
): Promise<DishInfo[]> {
  const html = await fetchHtml(baseUrl);
  if (!html) return [];

  const pageDom = new JSDOM(html);
  const document = pageDom.window.document;

  // Look for all dish categories
  // Try different selectors that might contain dish categories
  const linkElements = document.querySelectorAll("a.thumb_img.thumb_5x5");

  linkElements.forEach((element) => {
    const href = element.getAttribute("href");
    const title = element.getAttribute("title");

    if (href && title) {
      // Make sure the link is absolute
      const absoluteLink = href.startsWith("http")
        ? href
        : href.startsWith("/")
          ? `https://vnexpress.net${href}`
          : `https://vnexpress.net/${href}`;

      allDishes.set(title, absoluteLink);
    }
  });

  // Add a delay to be respectful to the server
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check for pagination
  const nextPageEl = document.querySelector(".pagination_btn.pa_next");
  const nextPageHref = nextPageEl?.getAttribute("href");
  if (nextPageHref) {
    const href = nextPageHref.startsWith("/")
      ? "https://vnexpress.net" + nextPageHref
      : nextPageHref;
    return getDishCategoryLinks(href, allDishes);
  }

  return allDishes
    .entries()
    .toArray()
    .map<DishInfo>(([name, link]) => ({ name, link }));
}

export async function updateDishLinks() {
  try {
    // First, create a backup of the current recipes.json file
    if (await fs.pathExists(recipesJsonPath)) {
      const backupPath = path.join(
        __dirname,
        "data",
        `recipes.backup-${Date.now()}.json`,
      );
      await fs.copy(recipesJsonPath, backupPath);
      console.log(`Created backup at: ${backupPath}`);

      // Read the current dishes for comparison
      const currentDishesRaw = await fs.readFile(recipesJsonPath, "utf8");
      const currentDishes: DishInfo[] = JSON.parse(currentDishesRaw);
      console.log(`Current dishes count: ${currentDishes.length}`);
    }

    // Get the fresh list of dishes
    console.log("Fetching all dish categories from VnExpress...");

    const freshDishes = await getDishCategoryLinks();

    console.log(`Found ${freshDishes.length} dish categories`);

    if (freshDishes.length === 0) {
      console.error(
        "No dishes found. Check the selectors or the website structure may have changed.",
      );
      return;
    }

    // Sort the dishes by name for easier reading
    freshDishes.sort((a, b) => a.name.localeCompare(b.name));

    // Save the fresh dish list
    await fs.writeJSON(recipesJsonPath, freshDishes, { spaces: 2 });

    console.log("Dish links refresh completed successfully!");
    console.log(`Total dish categories saved: ${freshDishes.length}`);
  } catch (error) {
    console.error("Error refreshing dish links:", error);
  }
}
