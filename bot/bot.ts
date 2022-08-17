import { Client } from "discord.js";
import CommandLoader from "./loaders/commandLoader";
import ModuleLoader from "./loaders/moduleLoader";

export default class Bot {

    public moduleLoader: ModuleLoader
    public commandLoader: CommandLoader
  
  constructor(public client: Client) {
    this.client
      .on("ready", () => {
        console.info(`Logged in as ${this.client.user?.tag}`);

      })
    this.moduleLoader = new ModuleLoader(this);
    this.commandLoader = new CommandLoader(this.client);
    
  }
}
