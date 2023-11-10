#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";

// fixig __dirname scope issue in es6 modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




class lanaDocCLI {
  OPENAI_API_KEY: string; // api key gotten from open api
  currentDirectory: string = process.cwd(); // current working directory
  themesDirectory: string = path.join(__dirname, '../themes'); // themes directory
  exclusionDirs: Array<string> = ["node_modules", ".git", ".github", "docs", ".gitignore", ".DS_Store", ".env"]; // Directories to exclude while indexing project
  openai: any; // openai api instance

  // our constructor for our class
  constructor() {
    this.OPENAI_API_KEY = this.getOpenApiKey();
    this.openai = new OpenAI({ apiKey: this.getOpenApiKey() }); // instantiating the openai api

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
  // get global open api key
  getGlobalOpenApiKey(): string {
    return this.OPENAI_API_KEY;
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
      sourcePaths: {
        routes: [],
        implementation: [],
      },
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

  // Function to generate the lana.config.json file
  async generateLanaConfigFile() {
    const projectInfo = await this.getProjectMetaDataInfo();
    const configFilePath = path.join(this.currentDirectory, 'lana.config.json');
  
    // Convert the data to JSON with indentation (2 spaces)
    const configContent = JSON.stringify(projectInfo, null, 2);
  
    try {
      await fs.writeFile(configFilePath, configContent);
      console.log(`lana.config.json file generated successfully in root directory.`);
    } catch (err) {
      console.error("Failed to create lana.config.json file:", err);
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
    // List all the files in the themes directory
    const themeFiles = await this.listFilesInDirectory(this.themesDirectory);

    // set the default theme to the second theme in the themes directory
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
    console.log(result.theme);
    // console.log(path.join(__dirname, '../themes', result.theme));

    // move the files to the docs directory
    const source = path.join(__dirname, '../themes', result.theme);
    const destination = path.join(this.currentDirectory, 'docs-beta');

    try {
      await fs.copy(source, destination);
      console.log(`Successfuly initialized docs with '${result.theme}' theme in docs-beta/ directory.`)
    } catch (err) {
      console.error("Failed to initialized docs:", err);
    }
    


    return result;
  }

  // read dev's config file
  async readConfigFile(): Promise<any> {

    console.log("Reading config file...");
    const configFilePath = path.join(this.currentDirectory, 'lana.config.json');

    try {
      const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
      const configData = JSON.parse(configFileContent);
      return configData;
    } catch (error) {
      console.error('Error reading or parsing the config file:', error);
      return null;
    }
  }
 // read a file's content with only path
  async readAFileContent(filePath: string): Promise<string | null> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return fileContent;
    } catch (error) {
      console.error('Error reading the file:', error);
      return null;
    }
  }

  async convertToOpenAPISpec(){
       // TO DO
    // 1. read the dev's config file
    const configFile = await this.readConfigFile(); // read dev's config file
    // console.log(JSON.stringify(configFile.servers, null, 2));
    // 2. read the content of the "routes" and "implementation" files

    // getting the content of all routes files added by the dev in the lana.config.json file
    const routes = [];
    for (const filePath of configFile.sourcePaths.routes) {
        const content = await this.readAFileContent(filePath);
        if (content !== null) {
            if (routes.length > 0) {
                routes.push("\n\n");
            }
            routes.push(content.toString());
        }
    }
    // join the routes array to a string
   const routeStringContent = routes.join("");
//    console.log("routes files content start here => \n\n" , routeStringContent);

   // getting the content of all implementation files added by the dev in the lana.config.json file
    const implementations = [];
    for (const filePath of configFile.sourcePaths.implementation) {
        const content = await this.readAFileContent(filePath);
        if (content !== null) {
            if (implementations.length > 0) {
                implementations.push("\n\n");
            }
            implementations.push(content.toString());
        }
    }
    // join the implementations array to a string
    const implementationStringContent = implementations.join("");
    // console.log("implementation files content start here => \n\n" , implementationStringContent);

    // TO DO
    // Validate the yaml file
     
    const prompt = `Generate a yaml file api specification following the openAPI 3.0.0 standard 
    with this data. Add detailed user friendly explanations in descriptions of endpoints and good summaries.
     here is basic information about the api documenation:
    title: `+configFile.metaInfo.info.title+`,
    version: `+configFile.metaInfo.info.version+`,
    description: `+configFile.metaInfo.info.description+`,
    termsOfService: `+configFile.metaInfo.info.termsOfService+`,
    contact: `+JSON.stringify(configFile.metaInfo.info.contact, null, 2)+`,
    license: `+JSON.stringify(configFile.metaInfo.info.license, null, 2)+`,
    servers: `+JSON.stringify(configFile.metaInfo.servers, null, 2)+`,
     here are all the endpoints` + routeStringContent +`\n\n\n and here are all 
    the implementations: `+ implementationStringContent +"\n\n Extremely Important: don't include any explanations (DO NOT ADD ANY comments in the code) in your responses ";

   // 3. submit the content to the LLM
    const completion = await this.openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: prompt,
        max_tokens: 2097,
    });

    // Handle the response from LLM 
    const generatedContent = completion.choices[0].text; // Extract the generated content
    console.log(generatedContent);


   // 4. save the result to .yaml file at docs/public/resources/openapi-spec.yaml
   const filePath = './docs/public/resource/openapi-spec.yaml';

    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the generated content to the file (create or update)
    fs.writeFileSync(filePath, generatedContent);

    console.log('Saved OpenAPI spec to:', filePath);

  }



  






/**
* All the command functions that will be called by yargs are defined here
*/


  // run the init process
async runInitCommand() {
    // we initialize the lana.config.json file
    await this.generateLanaConfigFile();
    console.log('✅ Done initializing... \n\n');
    console.log('Now run "lanadoc generate" to generate the docs reference file\n\n');
    console.log('...and cd to docs/ \n\n');
    console.log('Run "npm run serve" to start the doc server\n\n');
  }

  // run the generate process
  async runGenerateCommand() {
   await this.convertToOpenAPISpec();
  }
}


/**
* All the commands that can be run by the CLI tool are defined here
*/
// create a new instance of our class
const lana = new lanaDocCLI();

yargs(hideBin(process.argv))
  .command({
    command: 'init',
    describe: '- Initialize config file and docs', // description for the command
    handler: async () => {
    // we initialize the lana.config.json file
    console.log('Initializing lanadoc...');
     await lana.runInitCommand();
    },
  })
  .command({
    command: 'generate',
    describe: '- Generates docs refernce .yaml file', // description for the command
    handler: () => {
      // Add the logic for the "generate" command here
      // For example, you can call a generate function or perform any other action.
      console.log('🛠 Generating doc...');
      lana.runGenerateCommand();
      
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
