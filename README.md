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

This command initializes your project and generates a `lana.config.json` file in docs/ directory. This file contains essential meta info about your API doc and some customization like theme.

Available themes: ```'alternate' | 'default' | 'moon' | 'purple' | 'solarized' ```

### Step 2: Generate Documentation

Once your project is initialized, `cd` to docs/ directory and generate documentation with:

**Please make sure you have added your openai api key in your `.env` file as seen in the `.env_example` file.
**

```bash
lanadoc generate
```

This command processes your source code etc, turning your code into comprehensive documentation.

**🚨Important Note:** routes files and implementation to your endpoints are required in your `lana.config.json` to be able to generate the doc spec.

**Example**:
```js
// other configs
 "sourcePaths": {
    "routes": ["./routes/quote_route.js"],
    "implementation": ["./controllers/quote_controller.js"]
  },
// other configs
```

You should provide all the endpoint routes files paths in the `routes` array and their corresponding implementations in the `implementation` array as seen in the example code above. 

### Step 3: View Your Documentation

To view your generated documentation locally, start the lanadoc-cli server:

In the docs/ directory run...
```bash
npm run serve
```

This will launch a local dev server, allowing you to explore and interact with your doc site through your web browser.

**Note**: you need to have vue-cli installed globally
<!-- ## Contributing

We welcome contributions and bug reports. Please check out our [contribution guidelines](CONTRIBUTING.md) for details on how to get involved. -->

## License

lanadoc-cli is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
