import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("leavechannel", {
            aliases: ["sleavec"],
            permissions: ["MANAGE_GUILD"],
            category: "config",
            description: "Set or retrieve leave channel",
            usage: "[channel]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const channelIdOrName = args[0];
        const guild: GuildDB = message.guild as GuildDB;
        if (!channelIdOrName) {
            const currentLeaveChannel = channel.guild.channels.resolve(guild.getLeaveChannel);
            if (currentLeaveChannel) return channel.info(`The current leave channel is <#${currentLeaveChannel.id}>`);

            return channel.info("There is no leave channel");
        }

        const givenChannel =
            message.mentions.channels.first() ||
            channel.guild.channels.resolve(channelIdOrName) ||
            channel.guild.channels.cache.find((channel) => channel.name === channelIdOrName);

        if (givenChannel?.type === "category" || givenChannel?.type === "voice")
            return channel.error("Please provide a valid text channel");
        if (!givenChannel) return channel.error("I cant find the specified channel, please try again");

        guild
            .setLeaveChannel(givenChannel.id)
            .then(() => {
                channel.success(`Successfully updated leave channel to <#${givenChannel.id}> channel`);
            })
            .catch((err) => {
                console.error(err);
                channel.error("There was an unexpected error while updating leave channel, please try again");
            });
    }
};
