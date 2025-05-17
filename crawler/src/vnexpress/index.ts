import { program } from "commander";
import { updateDishLinks } from "./updateDishLinks";

program.option("-u, --update <dish|recipes>", "update specific data");
program.parse();

const options = program.opts();

if (options.update) {
  switch (options.update) {
    case "dish":
      updateDishLinks();
      break;
    case "recipes":
      console.log("recipes");
      break;
    default:
      console.error(
        `Invalid value for --update option: "${options.update}". Valid options are "dish" or "recipes".`,
      );
      process.exit(1);
  }
}
