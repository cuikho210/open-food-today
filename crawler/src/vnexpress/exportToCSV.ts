import * as fs from "fs";
import * as path from "path";

// Define interfaces matching the data structure
interface RecipeIngredient {
  name: string;
  optional: boolean;
}

interface RecipeStep {
  content: string;
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

// Define the output format matching the recipes table schema
interface RecipeCSV {
  title: string;
  link: string;
  description: string;
  image_url: string;
}

// Export options interface
export interface ExportOptions {
  outputFormat?: "csv" | "json";
  outputFile?: string;
}

// Function to escape CSV fields properly
function escapeCSV(field: string | undefined): string {
  if (field === undefined || field === null) {
    return "";
  }

  // First, normalize all line breaks (CR, LF, CRLF) to a standard form
  let normalized = String(field).replace(/\r\n|\r|\n/g, "\n");

  // Replace double quotes with two double quotes
  const escaped = normalized.replace(/"/g, '""');

  // If the field contains commas, newlines, or quotes, wrap it in quotes
  if (
    escaped.includes(",") ||
    escaped.includes("\n") ||
    escaped.includes('"')
  ) {
    return `"${escaped}"`;
  }

  return escaped;
}

// Main function to export recipes to CSV
export async function exportRecipesToCSV(
  options: ExportOptions = {},
): Promise<string> {
  try {
    // Determine directory paths
    const baseDir = process.cwd();
    const dataDir = path.join(baseDir, "src", "vnexpress", "data");
    const recipesDir = path.join(dataDir, "recipes");
    const defaultOutputFile = path.join(dataDir, "recipes_export.csv");
    const outputFile = options.outputFile || defaultOutputFile;

    console.log("Starting export to CSV...");
    console.log(`Base directory: ${baseDir}`);
    console.log(`Data directory: ${dataDir}`);
    console.log(`Recipes directory: ${recipesDir}`);
    console.log(`Output file: ${outputFile}`);

    // Check if recipes directory exists
    if (!fs.existsSync(recipesDir)) {
      throw new Error(`Recipes directory not found: ${recipesDir}`);
    }

    // Get all recipe files
    const recipeFiles = fs
      .readdirSync(recipesDir)
      .filter((file) => file.endsWith(".json"));

    console.log(`Found ${recipeFiles.length} recipe files`);

    // Create CSV header
    const csvHeader = "title,link,description,image_url\n";
    fs.writeFileSync(outputFile, csvHeader);

    let processedCount = 0;

    // Process each recipe file
    for (const file of recipeFiles) {
      try {
        const filePath = path.join(recipesDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const recipe: RecipeInfo = JSON.parse(fileContent);

        // Process description to ensure it doesn't break CSV format
        let description = recipe.description || "";
        // Truncate extremely long descriptions to prevent potential issues
        if (description.length > 5000) {
          description = description.substring(0, 5000) + "...";
        }

        // Map to CSV format using provided authorId
        const csvRecord: RecipeCSV = {
          title: recipe.title || "",
          link: recipe.link || "",
          description,
          image_url: recipe.imageUrl || "",
        };

        // Convert to CSV line
        const csvLine =
          [
            escapeCSV(csvRecord.title),
            escapeCSV(csvRecord.link),
            escapeCSV(csvRecord.description),
            escapeCSV(csvRecord.image_url),
          ].join(",") + "\n";

        // Append to CSV file
        fs.appendFileSync(outputFile, csvLine);

        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} recipes...`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }

    console.log(
      `Export complete! ${processedCount} recipes exported to ${outputFile}`,
    );
    return outputFile;
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

// If this file is run directly
if (require.main === module) {
  exportRecipesToCSV().catch((error) => {
    console.error("Export failed with an unhandled error:", error);
    process.exit(1);
  });
}
