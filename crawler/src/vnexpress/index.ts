import { program } from "commander";
import { updateDishLinks } from "./updateDishLinks";
import { crawlRecipes } from "./recipeCrawler";

program
  .option("-u, --update <dish|recipes>", "update specific data")
  .option(
    "-m, --mode <links|details|all>",
    "crawl mode for recipes (links, details, or all)",
    "all",
  );
program.parse();

const options = program.opts();

if (options.update) {
  switch (options.update) {
    case "dish":
      updateDishLinks();
      break;
    case "recipes":
      crawlRecipes(options.mode);
      break;
    default:
      console.error(
        `Invalid value for --update option: "${options.update}". Valid options are "dish" or "recipes".`,
      );
      process.exit(1);
  }
}
