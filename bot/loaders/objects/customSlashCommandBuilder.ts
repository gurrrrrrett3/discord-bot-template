import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandBuilder,
} from "discord.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption";
import CustomSlashCommandSubcommandBuilder from "./customSlashCommandSubcommand";
import CustomSubommandBuilder from "./customSlashCommandSubcommand";
import CustomSlashCommandSubcommandGroupBuilder from "./customSlashCommandSubcommandGroupBuilder";

export default class CommandBuilder {
  protected enabled: boolean = true;
  private _builder = new SlashCommandBuilder();
  private _customOptions: (
    | CustomSlashCommandStringOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandNumberOption
    | CustomSubommandBuilder
    | CustomSlashCommandSubcommandGroupBuilder
  )[] = [];
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> = async () => Promise.resolve();

  constructor() {}

  // commands that we don't need to change
  addAttachmentOption = this._builder.addAttachmentOption.bind(this._builder);
  addBooleanOption = this._builder.addBooleanOption.bind(this._builder);
  addChannelOption = this._builder.addChannelOption.bind(this._builder);
  addMentionableOption = this._builder.addMentionableOption.bind(this._builder);
  addRoleOption = this._builder.addRoleOption.bind(this._builder);
  addUserOption = this._builder.addUserOption.bind(this._builder);
  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  setFunction(callback: (interaction: ChatInputCommandInteraction) => Promise<void>): this {
    this.execute = callback;
    return this;
  }

  setName(name: string) {
    this._builder.setName(name);
    return this;
  }

  setNameLocalization(locale: LocaleString, localizedName: string | null) {
    this._builder.setNameLocalization(locale, localizedName);
    return this;
  }

  setNameLocalizations(localizedNames: LocalizationMap | null) {
    this._builder.setNameLocalizations(localizedNames);
    return this;
  }

  setDescription(description: string) {
    this._builder.setDescription(description);
    return this;
  }
  setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null) {
    this._builder.setDescriptionLocalization(locale, localizedDescription);
    return this;
  }

  setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null) {
    this._builder.setDescriptionLocalizations(localizedDescriptions);
    return this;
  }

  addStringOption(
    callback: (option: CustomSlashCommandStringOption) => CustomSlashCommandStringOption | undefined
  ): this {
    const opt = new CustomSlashCommandStringOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addStringOption(res.builder);
    return this;
  }

  addIntegerOption(
    callback: (option: CustomSlashCommandIntegerOption) => CustomSlashCommandIntegerOption | undefined
  ): this {
    const opt = new CustomSlashCommandIntegerOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addIntegerOption(res.builder);
    return this;
  }

  addNumberOption(
    callback: (option: CustomSlashCommandNumberOption) => CustomSlashCommandNumberOption | undefined
  ): this {
    const opt = new CustomSlashCommandNumberOption();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addNumberOption(res.builder);
    return this;
  }

  addSubcommandOption(
    callback: (option: CustomSlashCommandSubcommandBuilder) => CustomSlashCommandSubcommandBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandBuilder();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommand(res.builder);
    return this;
  }

  addSubcommandGroupOption(
    callback: (
      option: CustomSlashCommandSubcommandGroupBuilder
    ) => CustomSlashCommandSubcommandGroupBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandGroupBuilder();
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommandGroup(res.builder);
    return this;
  }

  toSlashCommandBuilder(): SlashCommandBuilder {
    return this._builder;
  }

  getName(): string {
    return this._builder.name;
  }

  run(interaction: ChatInputCommandInteraction): Promise<void> {
    console.log(interaction.options.data);
    const subcommand = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.Subcommand
    )
      ? interaction.options.getSubcommand()
      : null;
    const subcommandGroup = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
    )
      ? interaction.options.getSubcommandGroup()
      : null;

    if (subcommandGroup) {
      const subcommandGroupObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
      ) as CustomSlashCommandSubcommandGroupBuilder;
      subcommandGroupObject.run(interaction);
    } else if (subcommand) {
      const subcommandObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
      ) as CustomSlashCommandSubcommandBuilder;
      return subcommandObject.run(interaction);
    } else {
      return this.execute(interaction);
    }

    return Promise.resolve();
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.Subcommand
      )
        ? interaction.options.getSubcommand()
        : null;
      const subcommandGroup = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
      )
        ? interaction.options.getSubcommandGroup()
        : null;

      console.log(subcommandGroup, subcommand);

      if (subcommandGroup) {
        const subcommandGroupObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
        ) as CustomSlashCommandSubcommandGroupBuilder;
        return subcommandGroupObject.handleAutocomplete(interaction);
      } else if (subcommand) {
        const subcommandObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
        ) as CustomSlashCommandSubcommandBuilder;
        return subcommandObject.handleAutocomplete(interaction);
      } else {
        const selectedObject = this._customOptions.find(
          (o) => o.name === interaction.options.getFocused(true).name
        );
        if (!selectedObject || !selectedObject.isCustomOption()) return;
        if (selectedObject && selectedObject.autocompleteCallback) {
          if (selectedObject.takesStringTypeOption()) {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              interaction.options.getFocused()
            );
            interaction.respond(res.filter((r) => r.name.length > 0 && r.value.length > 0));
            return;
          } else {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              Number(interaction.options.getFocused())
            );
            interaction.respond(res.filter((r) => r.name.length > 0));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
