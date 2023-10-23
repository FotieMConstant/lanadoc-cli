#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";
class lanaDocCLI {
    constructor() {
        this.currentDirectory = process.cwd();
        this.themesDirectory = path.join(process.cwd(), "themes");
        this.OPENAI_API_KEY = this.getOpenApiKey();
    }
    getOpenApiKey() {
        try {
            dotenv.config();
            const apiKey = process.env.OPENAI_API_KEY || "";
            if (!apiKey) {
                console.error("No OPENAI_API_KEY found in the .env file.");
                process.exit(1);
            }
            console.log("OPENAI_API_KEY loaded successfully from the .env file.");
            return apiKey;
        }
        catch (err) {
            console.error("Error loading environment variables:", err);
            process.exit(1);
            return "";
        }
    }
    async getProjectMetaDataInfo() {
        const info = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Doc name (title):",
                default: path.basename(this.currentDirectory) + "-api-doc",
            },
            {
                type: "input",
                name: "version",
                message: "API version:",
                default: "1.0.0",
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
                default: "ISC",
            },
            {
                type: "input",
                name: "licenseURL",
                message: "License URL:",
            },
        ]);
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
        };
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
            lanaConfig.metaInfo.servers.push(server);
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
        const myTheme = await this.selectTheme();
        lanaConfig.theme = myTheme.theme;
        return lanaConfig;
    }
    async generateLanaConfigFile() {
        const projectInfo = await this.getProjectMetaDataInfo();
        const configFilePath = path.join(this.currentDirectory, "lana.config.ts");
        const configContent = `const lanaConfig = ${JSON.stringify(projectInfo, null, 2)
            .replace(/"([^"]+)":/g, "$1:")};\n\nexport default lanaConfig;\n`;
        try {
            await fs.writeFile(configFilePath, configContent);
            console.log(`lana.config.ts file created successfully in root directory.`);
        }
        catch (err) {
            console.error("Failed to create lana.config.ts file:", err);
        }
    }
    async listFilesInDirectory(directoryPath) {
        try {
            const files = await fs.readdir(directoryPath);
            return files;
        }
        catch (err) {
            console.error(`Failed to list files in the directory '${directoryPath}':`, err);
            return [];
        }
    }
    async selectTheme() {
        const themeFiles = await this.listFilesInDirectory(this.themesDirectory);
        let defaultTheme = "";
        if (themeFiles.length >= 2) {
            defaultTheme = themeFiles[1];
        }
        const result = await inquirer.prompt([
            {
                type: "list",
                name: "theme",
                message: "Select a theme:",
                choices: themeFiles,
                default: defaultTheme,
            },
        ]);
        return result;
    }
    async run() {
    }
}
yargs(hideBin(process.argv))
    .command({
    command: 'init',
    describe: '- Initialize config file and docs',
    handler: () => {
        const lana = new lanaDocCLI();
        lana.generateLanaConfigFile();
    },
})
    .demandCommand()
    .help()
    .parse();
//# sourceMappingURL=index.js.map