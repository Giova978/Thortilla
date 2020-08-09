import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import GuildDB from "../../../modules/discord/Guild";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("togglecategory", {
            aliases: ["togglemodule", "tgcat"],
            permissions: ["ADMINISTRATOR"],
            category: "config",
            description: "Toggle certain category of commands and events",
            usage: "<category> <on or off>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const module: string = args[0];
        if (!module || module === "config" || module === "debug") return channel.error("Please provide a valid category");
        const stateString = args[1];
        if (!stateString || !["on", "off"].includes(stateString)) return channel.error("Please provide a valid state");

        const guild: GuildDB = message.guild as GuildDB;

        const modules = guild.getModulesStatus;
        const modulesKeys = Object.keys(modules);

        if (!modulesKeys.includes(module)) return channel.error("Please provide a valid category");

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
