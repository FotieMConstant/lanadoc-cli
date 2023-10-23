import inquirer from "inquirer";

async function main() {
    const results =  await inquirer.prompt([{type: "list", name: "project", choices: ["hi", "hello"]}]);
    console.log(results);
}

main();