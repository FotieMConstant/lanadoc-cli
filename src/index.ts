import inquirer from "inquirer";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";


// async function main() {
//     const results =  await inquirer.prompt([{type: "list", name: "project", choices: ["hi", "hello"]}]);
//     console.log(results);
// }

// main();import inquirer from "inquirer";

class devWorkspaceCLI {
  OPENAI_API_KEY: string; // api key gotten from open api

  // our constructor for our class
  constructor() {
    this.OPENAI_API_KEY = this.getOpenApiKey();
  }
  // get the open api key from the .env file
  private getOpenApiKey(): string {
    try {
      // Load environment variables from .env file
      dotenv.config();

      // Retrieve the OPENAI_API_KEY
      const apiKey = process.env.OPENAI_API_KEY || "";
      if (!apiKey) {
        console.error("No OPENAI_API_KEY found in the .env file.");
        process.exit(1);
      }

      return apiKey;
    } catch (err) {
      console.error("Error loading environment variables:", err);
      process.exit(1);
      return ""; // Ensure a default value in case of error
    }
  }

  // list files and return all the file names in the directory as an array
  async listFilesInDirectory(directoryPath: string) {
    try {
      const files = await fs.readdir(directoryPath);
      console.log(`Files in the directory '${directoryPath}':`);
      console.log(files);
      return files; // returning the files
    } catch (err) {
      console.error(`Failed to list files in the directory '${directoryPath}':`, err);
      return []; // Ensure a default value in case of error
    }
  }

  async run() {
    const results = await inquirer.prompt([
      { type: "list", name: "project", choices: await this.listFilesInDirectory(path.join(process.cwd(), "themes")) }
    ]);
    console.log(results);

     // List files in the themes directory
    //  await this.listFilesInDirectory(path.join(process.cwd(), "themes"));
  }
}

const cli = new devWorkspaceCLI();
cli.run();
