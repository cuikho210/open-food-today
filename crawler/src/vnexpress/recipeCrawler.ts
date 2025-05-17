import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to store data
const dataDir = path.join(__dirname, "data");
const allRecipesPath = path.join(dataDir, "all_recipes.json");
const recipesJsonPath = path.join(dataDir, "recipes.json");

interface DishInfo {
  name: string;
  link: string;
}

interface RecipeLink {
  title: string;
  link: string;
}

interface RecipeIngredient {
  name: string;
  optional?: boolean;
}

interface RecipeStep {
  text: string;
  image?: string;
}

interface RecipeInfo {
  id: string;
  title: string;
  link: string;
  description: string;
  author?: string;
  imageUrl?: string;
  prepTime?: string;
  servingSize?: string;
  calories?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes?: string[];
  tags?: string[];
  createdAt: string;
}

interface CategoryRecipes {
  category: string;
  recipes: RecipeLink[];
}

/**
 * Fetches the HTML content from a URL
 */
async function fetchHtml(url: string, retries = 3): Promise<string> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (err: any) {
    console.error(`Error fetching ${url}:`, err.message);

    // If we have retries left and it's a recoverable error, try again
    if (
      retries > 0 &&
      (err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.response?.status === 429)
    ) {
      console.log(`Retrying... (${retries} attempts left)`);
      // Add an exponential backoff delay
      const delay = (4 - retries) * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchHtml(url, retries - 1);
    }

    return "";
  }
}

/**
 * Extracts recipe links from a dish category page
 */
async function getRecipeLinks(dishInfo: DishInfo): Promise<RecipeLink[]> {
  const html = await fetchHtml(dishInfo.link);
  if (!html) return [];

  const recipeLinks: RecipeLink[] = [];
  const $ = cheerio.load(html);

  // Extract links from the xem-nhanh-mon section
  $(".xem-nhanh-mon .list-mon li a").each((_, element) => {
    const title = $(element).text().trim();
    const dataId = $(element).attr("data-id");

    if (title && dataId) {
      // Construct the URL based on the article ID
      const link = `https://vnexpress.net/doi-song-cooking-${dataId}.html`;

      recipeLinks.push({
        title,
        link,
      });
    }
  });

  // If no links found in the quick view section, try to find article IDs in the page
  if (recipeLinks.length === 0) {
    // Try different selectors to find recipe articles
    const articleSelectors = [
      ".article-item",
      ".art_item",
      "[id^='article-']",
      ".item-news",
      ".item_news",
      ".list-news-subfolder .item-news-common",
      ".list-dish article",
    ];

    const selector = articleSelectors.join(", ");

    $(selector).each((_, element) => {
      const articleId =
        $(element).attr("id")?.replace("article-", "") ||
        $(element).attr("data-id");
      const titleElement = $(element)
        .find(".title-news, .title_news, h4.title_news, h3.title_news")
        .first();
      const title = titleElement.text().trim();
      let link = "";

      // Try to get the link directly
      const linkElement = titleElement.closest("a").length
        ? titleElement.closest("a")
        : $(element).find("a").first();
      if (linkElement.length) {
        link = linkElement.attr("href") || "";
      }

      // If we have a direct link, use it
      if (link && !link.includes("javascript:void") && title) {
        // Make sure the link is absolute
        if (!link.startsWith("http")) {
          link = link.startsWith("/")
            ? `https://vnexpress.net${link}`
            : `https://vnexpress.net/${link}`;
        }

        recipeLinks.push({
          title,
          link,
        });
      }
      // Otherwise construct from article ID if available
      else if (title && articleId) {
        link = `https://vnexpress.net/doi-song-cooking-${articleId}.html`;

        recipeLinks.push({
          title,
          link,
        });
      }
    });
  }

  console.log(
    `Found ${recipeLinks.length} recipes for dish category: ${dishInfo.name}`,
  );
  return recipeLinks;
}

/**
 * Extracts recipe information from a recipe page
 */
async function getRecipeDetails(
  recipeLink: RecipeLink,
): Promise<RecipeInfo | null> {
  const html = await fetchHtml(recipeLink.link);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Extract the article ID
  const articleId =
    $(".page-detail__v2").attr("id")?.replace("article-", "") ||
    recipeLink.link.split("-").pop()?.replace(".html", "") ||
    Date.now().toString();

  // Extract recipe title
  const title = $(".title-detail").text().trim() || recipeLink.title;

  // Extract description
  const description = $(".description").text().trim() || "";

  // Extract author
  let author = $(".name b").text().trim() || "";

  // Try alternative selectors if author is empty
  if (!author) {
    $(".author b, .author-name, .author strong").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        author = text;
      }
    });
  }

  // Extract main image URL
  const imageUrl =
    $(".fig-picture img").attr("data-src") ||
    $(".fig-picture img").attr("src") ||
    "";

  // Extract preparation time, serving size, and calories
  let prepTime = "";
  let servingSize = "";
  let calories = "";

  $(".status .itemt span, .status flex .itemt span").each((_, element) => {
    const text = $(element).text().trim();
    const parentElement = $(element).parent();

    if (parentElement.length) {
      // Try to determine the type based on the SVG icon
      const svgUse = parentElement.find(".icon-svg use");
      if (svgUse.length) {
        const href = svgUse.attr("xlink:href");
        if (href?.includes("clock")) {
          prepTime = text;
        } else if (href?.includes("mon")) {
          servingSize = text;
        } else if (href?.includes("kcal")) {
          calories = text;
        }
      }

      // If SVG approach doesn't work, try with the parent's text content
      if (!prepTime && !servingSize && !calories) {
        const fullText = parentElement.text().trim();
        if (fullText.includes("phút")) {
          prepTime = text;
        } else if (fullText.includes("người")) {
          servingSize = text;
        } else if (fullText.includes("kcal")) {
          calories = text;
        }
      }
    }
  });

  // Extract ingredients
  const ingredients: RecipeIngredient[] = [];
  const ingredientElements = $(".choose-ingredients .check-list .name");

  if (ingredientElements.length > 0) {
    ingredientElements.each((_, element) => {
      const ingredientText = $(element).text().trim();
      if (ingredientText) {
        const isOptional = ingredientText.toLowerCase().includes("tùy chọn");
        ingredients.push({
          name: ingredientText,
          optional: isOptional,
        });
      }
    });
  } else {
    // Try alternative selectors
    $("ul.choose-ingredients li, .col-1 ul li").each((_, element) => {
      const ingredientText = $(element).text().trim();
      if (ingredientText) {
        const isOptional = ingredientText.toLowerCase().includes("tùy chọn");
        ingredients.push({
          name: ingredientText,
          optional: isOptional,
        });
      }
    });
  }

  // Extract cooking steps
  const steps: RecipeStep[] = [];
  $(".ol-list li").each((_, element) => {
    const text =
      $(element).find(".Normal").text().trim() || $(element).text().trim();
    const image =
      $(element).find("img").attr("data-src") ||
      $(element).find("img").attr("src") ||
      "";

    if (text) {
      steps.push({
        text,
        image: image || undefined,
      });
    }
  });

  // Extract notes
  const notes: string[] = [];

  // Try multiple selectors for notes
  const noteSelectors = [
    ".extra_info li .Normal",
    ".extra_info ul li",
    ".extra_info p",
    ".extra_info li",
    ".extra-info li",
    ".chuy li",
    ".extra_info strong + li",
  ];

  // Combine all selectors
  const noteSelector = noteSelectors.join(", ");

  $(noteSelector).each((_, element) => {
    const noteText = $(element).text().trim();
    if (noteText && !notes.includes(noteText)) {
      notes.push(noteText);
    }
  });

  // If no notes found with regular selectors, try to extract any extra information
  if (notes.length === 0) {
    const extraInfoSelectors = [
      ".extra_info",
      ".extra-info",
      ".chuy",
      ".notes",
    ];

    for (const selector of extraInfoSelectors) {
      const extraInfoElement = $(selector);
      if (extraInfoElement.length) {
        const extraInfoText = extraInfoElement.text().trim();
        if (extraInfoText) {
          // Split by line breaks and filter out empty lines
          const extraInfoLines = extraInfoText
            .split(/[\r\n]+/)
            .map((line) => line.trim())
            .filter((line) => line && line.length > 10); // Filter out short lines

          // Add unique lines
          extraInfoLines.forEach((line) => {
            if (!notes.includes(line)) {
              notes.push(line);
            }
          });

          break; // If we found notes, no need to continue
        }
      }
    }
  }

  // Extract tags
  const tags: string[] = [];

  $(".resources li a, .resources ul li a").each((_, element) => {
    const tagText = $(element).text().trim();
    if (tagText) {
      tags.push(tagText);
    }
  });

  // If no tags found, try to extract the dish category from the breadcrumb
  if (tags.length === 0) {
    $(".breadcrumb-cooking li a, .breadcrumb li a").each((_, element) => {
      const tagText = $(element).text().trim();
      // Skip home or other navigation items
      if (
        tagText &&
        !tagText.includes("Trang chủ") &&
        !tagText.includes("Home")
      ) {
        tags.push(tagText);
      }
    });
  }

  // Filter out any steps that might just be heading text or too short
  // Also deduplicate steps
  const uniqueStepTexts = new Set<string>();
  const filteredSteps = steps.filter((step) => {
    // Remove numbering and clean up
    const text = step.text.replace(/^(\d+\.|Bước \d+:|Step \d+:)/i, "").trim();

    // Skip very short steps or steps that we've already included
    if (text.length <= 15 || uniqueStepTexts.has(text.toLowerCase())) {
      return false;
    }

    uniqueStepTexts.add(text.toLowerCase());
    return true;
  });

  return {
    id: articleId,
    title,
    link: recipeLink.link,
    description,
    author,
    imageUrl,
    prepTime,
    servingSize,
    calories,
    ingredients,
    steps:
      filteredSteps.length > 0 ? filteredSteps : steps.length > 0 ? steps : [], // Use filtered only if we have enough steps
    notes: notes.length > 0 ? notes : undefined,
    tags: tags.length > 0 ? tags : undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Crawls all recipe links from all dish categories
 */
export async function crawlAllRecipes(): Promise<void> {
  try {
    console.log("======================================================");
    console.log(
      "Starting to crawl recipe links from VnExpress at:",
      new Date().toLocaleString(),
    );
    console.log("======================================================");

    // Create the data directory if it doesn't exist
    await fs.ensureDir(dataDir);

    // Read the dish categories
    console.log("Reading dish categories...");
    let dishes: DishInfo[] = [];
    try {
      const dishesRaw = await fs.readFile(recipesJsonPath, "utf8");
      dishes = JSON.parse(dishesRaw);
    } catch (err) {
      console.error("Error reading recipes.json file:", err);
      console.log(
        "Please run `bun run src/vnexpress/index.ts -u dish` first to generate recipes.json",
      );
      return;
    }

    console.log(`Found ${dishes.length} dish categories`);
    if (dishes.length === 0) {
      console.error(
        "No dish categories found. Please update dish links first.",
      );
      return;
    }

    const allCategories: CategoryRecipes[] = [];

    // Process each dish category
    for (const dish of dishes) {
      const categoryFileName =
        dish.name
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") + ".json";
      const categoryFilePath = path.join(dataDir, categoryFileName);

      console.log(`Processing ${dish.name}...`);
      try {
        const recipeLinks = await getRecipeLinks(dish);

        if (recipeLinks.length > 0) {
          // Save the recipe links for this category
          await fs.writeJSON(categoryFilePath, recipeLinks, { spaces: 2 });
          console.log(
            `Saved ${recipeLinks.length} recipe links to ${categoryFilePath}`,
          );

          allCategories.push({
            category: dish.name,
            recipes: recipeLinks,
          });
        } else {
          console.warn(`No recipe links found for category: ${dish.name}`);
        }
      } catch (error) {
        console.error(`Error processing category ${dish.name}:`, error);
      }

      // Add delay to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Save all recipe links to a single file
    await fs.writeJSON(allRecipesPath, allCategories, { spaces: 2 });
    console.log(`Saved all recipe links to ${allRecipesPath}`);

    // Create the recipes directory for future recipe details
    const recipesDir = path.join(dataDir, "recipes");
    await fs.ensureDir(recipesDir);

    // Count and report total links found
    let totalLinksFound = 0;
    allCategories.forEach((category) => {
      totalLinksFound += category.recipes.length;
    });

    console.log("======================================================");
    console.log(`Crawling completed at: ${new Date().toLocaleString()}`);
    console.log(`Total categories processed: ${allCategories.length}`);
    console.log(`Total recipe links found: ${totalLinksFound}`);
    console.log("======================================================");
  } catch (error) {
    console.error("Error crawling recipe links:", error);
  }
}

/**
 * Fetches and parses recipes from the previously collected links
 */
export async function fetchRecipeDetails(): Promise<void> {
  try {
    console.log("======================================================");
    console.log(
      "Starting to fetch recipe details at:",
      new Date().toLocaleString(),
    );
    console.log("======================================================");

    // Create the recipes directory if it doesn't exist
    const recipesDir = path.join(dataDir, "recipes");
    await fs.ensureDir(recipesDir);

    // Read all recipe links
    console.log("Reading recipe links...");

    // Check if all_recipes.json exists
    if (!(await fs.pathExists(allRecipesPath))) {
      console.error(
        `${allRecipesPath} not found. Please run crawler in 'links' mode first.`,
      );
      return;
    }

    const allRecipesRaw = await fs.readFile(allRecipesPath, "utf8");
    let allCategories: CategoryRecipes[] = [];

    try {
      allCategories = JSON.parse(allRecipesRaw);
    } catch (err) {
      console.error("Error parsing all_recipes.json:", err);
      return;
    }

    let totalRecipes = 0;
    let processedRecipes = 0;
    let successfulRecipes = 0;
    let failedRecipes = 0;
    let skippedRecipes = 0;
    const startTime = Date.now();

    // Count total recipes across all categories
    allCategories.forEach((category) => {
      totalRecipes += category.recipes.length;
    });

    console.log(`Found ${totalRecipes} total recipes to process`);

    if (totalRecipes === 0) {
      console.error(
        "No recipes found. Please run crawler in 'links' mode first.",
      );
      return;
    }

    // Create a log file for errors
    const logPath = path.join(dataDir, "crawler_errors.log");
    let errorLog = `Crawler Errors - ${new Date().toISOString()}\n\n`;

    // Process each category
    for (const category of allCategories) {
      console.log(`Processing recipes for category: ${category.category}`);

      // Process each recipe in the category
      for (const recipeLink of category.recipes) {
        processedRecipes++;
        console.log(
          `Processing recipe ${processedRecipes} of ${totalRecipes}: ${recipeLink.title}`,
        );

        try {
          // Extract recipe ID from the link or use the title
          const recipeId =
            recipeLink.link.split("-").pop()?.replace(".html", "") ||
            recipeLink.title
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, "");

          const recipeFilePath = path.join(recipesDir, `${recipeId}.json`);

          // Skip if the recipe has already been processed
          if (await fs.pathExists(recipeFilePath)) {
            console.log(`Recipe ${recipeId} already exists, skipping...`);
            skippedRecipes++;
            continue;
          }

          // Fetch and parse the recipe details
          const recipeDetails = await getRecipeDetails(recipeLink);

          if (recipeDetails) {
            // Save the recipe details
            await fs.writeJSON(recipeFilePath, recipeDetails, { spaces: 2 });
            console.log(`Saved recipe details to ${recipeFilePath}`);
            successfulRecipes++;
          } else {
            console.error(
              `Failed to fetch recipe details for ${recipeLink.title}`,
            );
            errorLog += `Failed to fetch: ${recipeLink.title} (${recipeLink.link})\n`;
            failedRecipes++;
          }
        } catch (err: any) {
          console.error(
            `Error processing recipe ${recipeLink.title}:`,
            err.message,
          );
          errorLog += `Error processing: ${recipeLink.title} (${recipeLink.link})\n`;
          errorLog += `  Error: ${err.message}\n`;
          failedRecipes++;
        }

        // Add delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Print progress every 10 recipes
        if (processedRecipes % 10 === 0) {
          const elapsedTime = (Date.now() - startTime) / 1000; // seconds
          const recipesPerSecond = processedRecipes / elapsedTime;
          const estimatedTotalTime = totalRecipes / recipesPerSecond; // seconds
          const estimatedRemainingTime = estimatedTotalTime - elapsedTime; // seconds

          console.log(`
Progress: ${processedRecipes}/${totalRecipes} (${((processedRecipes / totalRecipes) * 100).toFixed(2)}%)
Success: ${successfulRecipes}, Failed: ${failedRecipes}, Skipped: ${skippedRecipes}
Time elapsed: ${(elapsedTime / 60).toFixed(2)} minutes
Estimated time remaining: ${(estimatedRemainingTime / 60).toFixed(2)} minutes
          `);
        }
      }
    }

    // Save error log if there were failures
    if (failedRecipes > 0) {
      await fs.writeFile(logPath, errorLog);
      console.log(`Error log saved to ${logPath}`);
    }

    console.log(`
Recipe Processing Summary:
-------------------------
Total Recipes: ${totalRecipes}
Processed: ${processedRecipes}
Successful: ${successfulRecipes} (${((successfulRecipes / totalRecipes) * 100).toFixed(2)}%)
Failed: ${failedRecipes} (${((failedRecipes / totalRecipes) * 100).toFixed(2)}%)
Skipped (already exist): ${skippedRecipes} (${((skippedRecipes / totalRecipes) * 100).toFixed(2)}%)
Processing Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(2)} minutes

Crawl completed at: ${new Date().toLocaleString()}
======================================================
    `);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

/**
 * Main function that initiates the crawling process
 */
export async function crawlRecipes(
  mode: "links" | "details" | "all" = "all",
): Promise<void> {
  const globalStartTime = Date.now();

  try {
    if (mode === "links" || mode === "all") {
      console.log("Starting to crawl recipe links...");
      await crawlAllRecipes();
    }

    if (mode === "details" || mode === "all") {
      console.log("Starting to fetch recipe details...");
      await fetchRecipeDetails();
    }

    const totalTimeMinutes = (
      (Date.now() - globalStartTime) /
      1000 /
      60
    ).toFixed(2);
    console.log("======================================================");
    console.log(`Recipe crawling completed in ${totalTimeMinutes} minutes!`);
    console.log("======================================================");
  } catch (error) {
    console.error("Critical error in crawling process:", error);
    console.log("Crawling process terminated with errors.");
  }
}
