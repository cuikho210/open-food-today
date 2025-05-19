import { program } from "commander";
import { updateDishLinks } from "./updateDishLinks";
import { crawlRecipes } from "./recipeCrawler";
import { exportRecipesToCSV } from "./exportToCSV";

program
  .option("-u, --update <dish|recipes>", "update specific data")
  .option(
    "-m, --mode <links|details|all>",
    "crawl mode for recipes (links, details, or all)",
    "all",
  )
  .option("-x, --export", "export csv file")
  .option("-o, --output <file>", "output file path for exports");
program.parse();

const options = program.opts();

if (options.update) {
  switch (options.update) {
    case "dish":
      await updateDishLinks();
      break;
    case "recipes":
      await crawlRecipes(options.mode);
      break;
    default:
      console.error(
        `Invalid value for --update option: "${options.update}". Valid options are "dish" or "recipes".`,
      );
      process.exit(1);
  }
}

if (options.export) {
  await exportRecipesToCSV({
    outputFile: options.output,
  });
}
