import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";
module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("setlogchannel", {
            aliases: ["slc"],
            permissions: ["MANAGE_GUILD"],
            category: "config",
            description: "Sets the log channel",
            usage: "<channel name or id>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const channelIdOrName = args[0];
        const guild: GuildDB = message.guild as GuildDB;
        if (!channelIdOrName) {
            const currentLogChannel = channel.guild.channels.resolve(guild.getLogChannel);
            if (currentLogChannel) return channel.info(`The current log channel is <#${currentLogChannel.id}>`);

            return channel.info("There is no log channel");
        }

        const givenChannel =
            message.mentions.channels.first() ||
            channel.guild.channels.resolve(channelIdOrName) ||
            channel.guild.channels.cache.find((channel) => channel.name === channelIdOrName);

        if (givenChannel?.type === "category" || givenChannel?.type === "voice")
            return channel.error("Please provide a valid text channel");
        if (!givenChannel) return channel.error("I cant find the specified channel, please try again");

        guild
            .setLogChannel(givenChannel.id)
            .then(() => {
                channel.success(`Successfully updated log channel to <#${givenChannel.id}> channel`);
            })
            .catch((err) => {
                this.handler.logger.error(err);
                channel.error("There was an unexpected error while updating log channel, please try again");
            });
    }
};
