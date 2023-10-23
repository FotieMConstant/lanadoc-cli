# lanadoc-cli

A command-line tool that seamlessly integrates with [Project-Lana](https://github.com/FotieMConstant/project-lana).

## Key Features

- **Effortless API doc generation**: Automatically generate comprehensive API documentation directly from your source code.
- **Interactive local server**: Instantly view and interact with your API documentation using the built-in local server.
- **Cross-Platform compatibility**: Works seamlessly on Windows, macOS, and Linux, ensuring flexibility across different development environments.
- **Fully Themeable**: Customize your API documentation by adjusting settings and themes to suit your specific needs.
- **Streamlined Project Setup**: Initialize your API documentation project quickly with a single command.



## Installation

To install lanadoc-cli globally, use npm:

```bash
npm install -g lanadoc-cli
```

## Getting Started

Let's get your documentation project up and running.

### Step 1: Initialize a Project

Use the following command to create a new lanadoc-cli project:

```bash
lanadoc init
```

This command initializes your project and generates the `lana.config.ts` file in your project's root directory. This file contains essential meta info about your API doc and some customization.

### Step 2: Generate Documentation

Once your project is initialized, generate documentation with:

```bash
lanadoc generate
```

This command processes your source code, file structure etc, turning your code into comprehensive documentation.

### Step 3: View Your Documentation

To view your generated documentation locally, start the lanadoc-cli server:

```bash
lanadoc serve
```

This will launch a local server, allowing you to explore and interact with your documentation through a web browser.

<!-- ## Contributing

We welcome contributions and bug reports. Please check out our [contribution guidelines](CONTRIBUTING.md) for details on how to get involved. -->

## License

lanadoc-cli is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
