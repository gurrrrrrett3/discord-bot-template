import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption";

export default class CustomSlashCommandSubcommandBuilder {
  protected enabled: boolean = true;
  private _builder = new SlashCommandSubcommandBuilder();
  private _customOptions: (
    | CustomSlashCommandStringOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandNumberOption
  )[] = [];
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> = async () => Promise.resolve();

  constructor() {}

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

  // commands that we don't need to change
  addAttachmentOption = this._builder.addAttachmentOption.bind(this._builder);
  addBooleanOption = this._builder.addBooleanOption.bind(this._builder);
  addChannelOption = this._builder.addChannelOption.bind(this._builder);
  addMentionableOption = this._builder.addMentionableOption.bind(this._builder);
  addRoleOption = this._builder.addRoleOption.bind(this._builder);
  addUserOption = this._builder.addUserOption.bind(this._builder);

  // commands that we need to change

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

  get builder(): SlashCommandSubcommandBuilder {
    return this._builder;
  }

  get name(): string {
    return this._builder.name;
  }

  isCustomOption(): this is
    | CustomSlashCommandNumberOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandStringOption {
    return false;
  }

  run(interaction: ChatInputCommandInteraction): Promise<void> {
    return this.execute(interaction);
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const selectedOption = this._customOptions.find(
        (opt) => opt.name === interaction.options.getFocused(true).name
      );

      if (selectedOption && selectedOption.autocompleteCallback) {
        if (selectedOption.takesStringTypeOption()) {
          await interaction.respond(
            await selectedOption.autocompleteCallback(interaction, interaction.options.getFocused())
          );
          return;
        } else {
          await interaction.respond(
            await selectedOption.autocompleteCallback(interaction, Number(interaction.options.getFocused()))
          );
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
