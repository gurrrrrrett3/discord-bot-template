import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  REST,
  Collection,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import fs from "fs";
import path from "path";
import CommandBuilder from "./objects/customSlashCommandBuilder";

interface Command {
  default: CommandBuilder;
}

export default class CommandLoader {
  public client: Client;
  public commands: Collection<string, CommandBuilder> = new Collection();

  constructor(client: Client) {
    this.client = client;

    this.client.once("ready", async () => {
      const applicationId = this.client.application?.id ?? this.client.user?.id ?? "unknown";

      //Collect list of command files
      let commandsToDeploy: RESTPostAPIApplicationCommandsJSONBody[] = [];
      const commandFiles = fs
        .readdirSync(path.resolve("./dist/bot/commands"))
        .filter((file) => file.endsWith(".js"));

      console.log(`Deploying ${commandFiles.length} commands`);

      //Import off of the commands as modules
      for (const file of commandFiles) {
        const command: Command = require(path.resolve(`./dist/bot/commands/${file}`));
        this.commands.set(command.default.getName(), command.default);
        commandsToDeploy.push(command.default.toJSON());
      }

      const rest = new REST({ version: "10" }).setToken(this.client.token as string);

      this.client.application?.commands.set([]);

      //Push to Discord
      if (process.env.MODE == "guild") {
        rest
          .put(Routes.applicationGuildCommands(applicationId, process.env.GUILD_ID as string), {
            body: commandsToDeploy,
          })
          .then(() => {
            console.log(`${this.commands.size} commands deployed`);
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        rest
          .put(Routes.applicationCommands(applicationId), {
            body: commandsToDeploy,
          })
          .then(() => {
            console.log(`${this.commands.size} commands deployed`);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });

    //Handle running commands, and direct them to the correct handler function
    this.client.on("interactionCreate", (interaction) => {
      // handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = this.commands.get(interaction.commandName);
        if (command) command.handleAutocomplete(interaction);
      }

      if (!interaction.isCommand()) return; // Ignore non-command interactions
      if (interaction.replied) return; // Ignore interactions that have already been replied to

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.isChatInputCommand()) return command.run(interaction);

      
      
    });
  }
}
