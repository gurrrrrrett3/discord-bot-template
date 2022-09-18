# Discord Bot Template
 
 This template was originally made by me to stop having to rewrite boilerplate code for every bot I make. It's expanded a lot since then, and I've done my best to make it as easy to use as possible.

# Table of Contents <!-- omit in toc -->
- [Discord Bot Template](#discord-bot-template)
  - [Features](#features)
  - [Installation](#installation)
  - [How to create a module](#how-to-create-a-module)
  - [Creating a command](#creating-a-command)
  - [Creating a context menu command](#creating-a-context-menu-command)
  - [Registering a button, select menu, or modal](#registering-a-button-select-menu-or-modal)
  - [Unregistering a button, select menu, or modal](#unregistering-a-button-select-menu-or-modal)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

## Features

- [x] Command handler
- [x] Designed to be Modular
- [x] Custom Command Builder
- [x] Slash Command Support
- [x] Context Menu Support
- [x] Autocomplete support
- [x] Button, Select Menu, and Modal event handling

## Installation

1. Clone the repository
2. Run `npm install` in the root directory
3. Copy the `.env.template` file to `.env` and fill in the values
4. Run `tsc` to compile
5. Run `node .` to start the bot

## How to create a module

```
node ./scripts/createModule.js <name> <description>
```

## Creating a command

1. Create a new file in the `bot/modules/<module>/commands` directory
2. Use the `command` snippet

## Creating a context menu command

1. Create a new file in the `bot/modules/<module>/commands` directory
2. Use the `userContextMenu` or `messageContextMenu` snippet

## Registering a button, select menu, or modal

```ts

import { bot } from "../../.."; // Import the bot from the root directory


bot.buttonManager.registerButton("customId", async (interaction) => {
  // Do something
});

bot.selectMenuManager.registerSelectMenu("customId", async (interaction) => {
  // Do something
});

bot.modalManager.registerModal("customId", async (interaction) => {
  // Do something
});

```

## Unregistering a button, select menu, or modal

```ts

import { bot } from "../../.."; // Import the bot from the root directory

bot.buttonManager.unregisterButton("customId");
bot.selectMenuManager.unregisterSelectMenu("customId");
bot.modalManager.unregisterModal("customId");

```

# Contributing

If you have any suggestions, feel free to open an issue or pull request. 

# License

This project is licensed under the [MIT License](LICENSE.md).

# Credits

- [Discord.js](https://discord.js.org/) - The Discord API wrapper used
- [Chalk](https://npmjs.org/chalk) - Used for nice console logging