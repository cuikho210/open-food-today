import axios from "axios";
import { JSDOM } from "jsdom";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the recipes.json file
const recipesJsonPath = path.join(__dirname, "recipes.json");
const outputDirPath = path.join(__dirname, "data");

// Ensure output directory exists
fs.ensureDirSync(outputDirPath);

interface DishInfo {
  name: string;
  link: string;
}

interface RecipeInfo {
  title: string;
  link: string;
}

/**
 * Fetches the HTML content of a URL
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
 * Extracts recipe links from a dish page
 */
async function getRecipeLinksFromDishPage(
  dishUrl: string,
): Promise<RecipeInfo[]> {
  const html = await fetchHtml(dishUrl);
  if (!html) return [];

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const recipeLinks: RecipeInfo[] = [];

  // Find recipe links on the page - these are typically in article listings
  const recipeElements = document.querySelectorAll(".item-news, .list-news-subfolder .item");
  
  recipeElements.forEach((element) => {
    const linkElement = element.querySelector("a");
    const titleElement = element.querySelector(".title-news, .title");
    
    if (linkElement && titleElement) {
      const link = linkElement.href;
      const title = titleElement.textContent?.trim() || "";
      
      // Make sure the link is absolute and points to a recipe
      const absoluteLink = link.startsWith("http") 
        ? link 
        : link.startsWith("/") 
          ? `https://vnexpress.net${link}` 
          : `https://vnexpress.net/${link}`;
      
      // Only include recipe links, not category links
      if (absoluteLink.includes(".html") || absoluteLink.includes("cach-lam")) {
        recipeLinks.push({
          title,
          link: absoluteLink
        });
      }
    }
  });

  return recipeLinks;
}

/**
 * Gets all pages for a dish category
 */
async function getAllPagesForDish(dishUrl: string): Promise<string[]> {
  const urls = [dishUrl];
  const html = await fetchHtml(dishUrl);
  
  if (!html) return urls;
  
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Check for pagination
  const paginationElements = document.querySelectorAll(".pagination a");
  if (paginationElements.length > 0) {
    // Extract the page count from pagination
    for (let i = 2; i <= paginationElements.length; i++) {
      // Construct URLs for each page
      const pageUrl = `${dishUrl}-p${i}`;
      urls.push(pageUrl);
    }
  }
  
  return urls;
}

/**
 * Main function to crawl all dish pages and get recipe links
 */
async function crawlAllDishes() {
  try {
    // Read the dishes from the recipes.json file
    const dishesRaw = await fs.readFile(recipesJsonPath, "utf8");
    const dishes: DishInfo[] = JSON.parse(dishesRaw);
    
    // Create an object to store all recipe links by dish category
    const allRecipes: Record<string, RecipeInfo[]> = {};
    
    // Process each dish category
    for (const dish of dishes) {
      console.log(`Processing dish: ${dish.name}`);
      
      // Get all pages for this dish
      const dishPages = await getAllPagesForDish(dish.link);
      console.log(`Found ${dishPages.length} pages for ${dish.name}`);
      
      let allDishRecipes: RecipeInfo[] = [];
      
      // Process each page of the dish category
      for (const pageUrl of dishPages) {
        console.log(`Processing page: ${pageUrl}`);
        // Get recipe links for this dish page
        const recipeLinks = await getRecipeLinksFromDishPage(pageUrl);
        console.log(`Found ${recipeLinks.length} recipes on this page`);
        
        // Add to all recipes for this dish
        allDishRecipes = [...allDishRecipes, ...recipeLinks];
        
        // Add a delay to be respectful to the server
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      console.log(`Total recipes found for ${dish.name}: ${allDishRecipes.length}`);
      
      // Store the recipe links
      allRecipes[dish.name] = allDishRecipes;
      
      // Save individual dish recipe links
      const dishFileName = dish.name.replace(/\s+/g, "_").toLowerCase();
      await fs.writeJSON(
        path.join(outputDirPath, `${dishFileName}.json`),
        allDishRecipes,
        { spaces: 2 }
      );
      
      // Add a delay to be respectful to the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Save all recipe links in one file
    await fs.writeJSON(
      path.join(outputDirPath, "all_recipes.json"),
      allRecipes,
      { spaces: 2 },
    );

    console.log("Crawling completed successfully!");
  } catch (error) {
    console.error("Error during crawling:", error);
  }
}

// Run the crawler
crawlAllDishes().catch(console.error);
