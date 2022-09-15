import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong!")
  .setFunction(async (interaction) => {
    interaction.reply("Pong!");
  });

export default Command;