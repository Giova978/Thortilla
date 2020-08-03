import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import GuildDB from "../../../modules/discord/Guild";

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

    public async run(message: Message, args: string[]) {
        const module: string = args[0];
        if (!module || module === "config" || module === "debug") return this.handler.error("Please provide a valid category", message.channel);
        const stateString = args[1];
        if (!stateString || !["on", "off"].includes(stateString)) return this.handler.error("Please provide a valid state", message.channel);

        const guild: GuildDB = message.guild as GuildDB;

        const modules = guild.getModulesStatus;
        const modulesKeys = Object.keys(modules);

        if (!modulesKeys.includes(module)) return this.handler.error("Please provide a valid category", message.channel);

        const state = stateString === "on" ? true : false;

        modules[module] = state;

        guild
            .setModulesStatus(modules)
            .then(() => {
                return message.channel.send(`Successfully changed \`${module}\` to \`${stateString}\``);
            })
            .catch((err) => {
                return this.handler.error("An error ocurred while changing module status, please try again later", message.channel);
            });
    }
};
