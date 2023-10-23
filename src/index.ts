#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";




class lanaDocCLI {
  OPENAI_API_KEY: string; // api key gotten from open api
  currentDirectory: string = process.cwd(); // current working directory
  themesDirectory: string = path.join(process.cwd(), "themes"); // themes directory

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
      console.log("OPENAI_API_KEY loaded successfully from the .env file.");
      return apiKey;
    } catch (err) {
      console.error("Error loading environment variables:", err);
      process.exit(1);
      return ""; // Ensure a default value in case of error
    }
  }

  // Function to prompt the user for project info
  async getProjectMetaDataInfo() {

    // Prompt for project info
    const info = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Doc name (title):",
        default: path.basename(this.currentDirectory) + "-api-doc", // Set the default title
      },
      {
        type: "input",
        name: "version",
        message: "API version:",
        default: "1.0.0", // Set a default version
      },
      {
        type: "input",
        name: "description",
        message: "API description:",
      },
      {
        type: "input",
        name: "termsOfService",
        message: "Terms of service URL:",
      },
      {
        type: "input",
        name: "contactName",
        message: "Contact name:",
      },
      {
        type: "input",
        name: "contactEmail",
        message: "Contact email:",
      },
      {
        type: "input",
        name: "contactURL",
        message: "Contact URL:",
      },
      {
        type: "input",
        name: "licenseName",
        message: "License name:",
        default: "ISC", // Set a default version
      },
      {
        type: "input",
        name: "licenseURL",
        message: "License URL:",
      },
    ]);
  
    // Prepare the data structure
    const lanaConfig = {
      theme: "Default",
      metaInfo: {
        info: {
        title: info.title,
        version: info.version,
        description: info.description,
        termsOfService: info.termsOfService,
        contact: {
          name: info.contactName,
          email: info.contactEmail,
          url: info.contactURL,
        },
        license: {
          name: info.licenseName,
          url: info.licenseURL,
        },
      },
      servers: [],
    }, 
    }

  
    // Prompt for servers
    let addServer = true;
    while (addServer) {
    
      const server = await inquirer.prompt([
        {
          type: "input",
          name: "url",
          message: "Server URL:",
        },
        {
          type: "input",
          name: "description",
          message: "Server description:",
        },
      ]);
      (lanaConfig.metaInfo.servers as string[]).push(server);
  
      const { addAnotherServer } = await inquirer.prompt([
        {
          type: "confirm",
          name: "addAnotherServer",
          message: "Add another server?",
          default: false,
        },
      ]);
  
      addServer = addAnotherServer;
    }
    // prompt dev to select a theme
   const myTheme = await this.selectTheme();
//    console.log("myTheme => ",myTheme);
    lanaConfig.theme = myTheme.theme; // set the theme to the selected theme
    
    return lanaConfig;
  }

  // Function to generate the lana.config.ts file
    async generateLanaConfigFile() {
    const projectInfo = await this.getProjectMetaDataInfo();
    const configFilePath = path.join(this.currentDirectory, "lana.config.ts");
  
    const configContent =`const lanaConfig = ${JSON.stringify(projectInfo, null, 2)
        .replace(/"([^"]+)":/g, "$1:")};\n\nexport default lanaConfig;\n`;
  
    try {
      await fs.writeFile(configFilePath, configContent);
      console.log(`lana.config.ts file created successfully in root directory.`);
    } catch (err) {
      console.error("Failed to create lana.config.ts file:", err);
    }
  }

  // list files and return all the file names in the directory as an array
  async listFilesInDirectory(directoryPath: string) {
    try {
      const files = await fs.readdir(directoryPath);
    //   console.log(`Files in the directory '${directoryPath}':`);
    //   console.log(files);
      return files; // returning the files
    } catch (err) {
      console.error(`Failed to list files in the directory '${directoryPath}':`, err);
      return []; // Ensure a default value in case of error
    }
  }

  // function to prompt dev to select a theme
  async selectTheme() {
    const themeFiles = await this.listFilesInDirectory(this.themesDirectory);

    let defaultTheme = "";
    if (themeFiles.length >= 2) {
      defaultTheme = themeFiles[1]; // Use the second file as the default team
    }

    const result = await inquirer.prompt([
      {
        type: "list",
        name: "theme",
        message: "Select a theme:",
        choices: themeFiles,
        default: defaultTheme, // Set the default theme
      },
    ]);
    // console.log(result);

    return result;
  }

  // main function that runs the script
  async run() {
    
    // await this.generateLanaConfigFile(); // generate the lana.config.ts file

    // const results = await inquirer.prompt([
    //   { type: "list", name: "theme", choices: await this.listFilesInDirectory(path.join(process.cwd(), "themes")) }
    // ]);
    // console.log(results);

     // List files in the themes directory
    //  await this.listFilesInDirectory(path.join(process.cwd(), "themes"));
  }
}

/**
* All the commands that can be run by the CLI tool are defined here
*/
yargs(hideBin(process.argv))
  .command({
    command: 'init',
    describe: '- Initialize config file and docs', // description for the command
    handler: () => {
    // we initialize the lana.config.ts file
      const lana = new lanaDocCLI();
      lana.generateLanaConfigFile();
    },
  })
  .command({
    command: 'generate',
    describe: '- Generates docs refernce .yaml file', // description for the command
    handler: () => {
      // Add the logic for the "generate" command here
      // For example, you can call a generate function or perform any other action.
      console.log('Generating something...');
    },
  })
  .command({
    command: 'serve',
    describe: '- Launches a node server to serve the docs', // description for the command
    handler: () => {
      console.log('Starting the server...');
      // Add logic to start a server, e.g., using Express or another framework.
    },
  })
  .demandCommand() // Require a command to be provided
  .help()
  .parse(); // Enable --help option
