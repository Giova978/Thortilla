import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import GuildDB from "../../../models/discord/Guild";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("prefix", {
            aliases: ["stp"],
            permissions: ["MANAGE_GUILD"],
            category: "config",
            description: "Set the prefix for the current guild or gets the current prefix",
            usage: "[prefix]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;

        const prefix = args[0];
        if (!prefix) return channel.error(`The current prefix is ${guild.getPrefix}`);

        guild
            .setPrefix(prefix)
            .then((text: string) => channel.info(text))
            .catch((err) => {
                channel.error("Something went wrong, please try again later");
                this.handler.logger.error(err);
            });
    }
};
