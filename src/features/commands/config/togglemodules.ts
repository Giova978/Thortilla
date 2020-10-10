import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import GuildDB from "../../../models/discord/Guild";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("togglemodules", {
            aliases: ["tgmod", "togglecategory"],
            permissions: ["ADMINISTRATOR"],
            category: "config",
            description: "Toggle certain module of Thortilla",
            usage: "<category> <on or off>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const module: string = args[0];
        if (!module || module === "config" || module === "debug") return channel.error("Please provide a valid module");
        const stateString = args[1];
        if (!stateString || !["on", "off"].includes(stateString)) return channel.error("Please provide a valid state");

        const guild: GuildDB = message.guild as GuildDB;

        const modules = guild.getModulesStatus;
        const availableModules = ["music", "balance", "fun", "info", "tags", "moderation"];

        if (!availableModules.includes(module)) return channel.error("Please provide a valid module");

        const state = stateString === "on" ? true : false;

        modules[module] = state;

        guild
            .setModulesStatus(modules)
            .then(() => {
                return channel.success(`Successfully changed \`${module}\` to \`${stateString}\``);
            })
            .catch((err) => {
                return channel.error("An error ocurred while changing module status, please try again later");
            });
    }
};
