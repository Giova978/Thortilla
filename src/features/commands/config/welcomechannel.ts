import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("welcomechannel", {
            aliases: ["swc"],
            permissions: ["MANAGE_GUILD"],
            category: "config",
            description: "Set or retrieve welcome channel",
            usage: "[channel]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const channelIdOrName = args[0];
        const guild: GuildDB = message.guild as GuildDB;
        if (!channelIdOrName) {
            const currentWelcomeChannel = channel.guild.channels.resolve(guild.getWelcomeChannel);
            if (currentWelcomeChannel)
                return channel.info(`The current welcome channel is <#${currentWelcomeChannel.id}>`);

            return channel.info("There is no welcome channel");
        }

        const givenChannel =
            message.mentions.channels.first() ||
            channel.guild.channels.resolve(channelIdOrName) ||
            channel.guild.channels.cache.find((channel) => channel.name === channelIdOrName);

        if (givenChannel?.type === "category" || givenChannel?.type === "voice")
            return channel.error("Please provide a valid text channel");
        if (!givenChannel) return channel.error("I cant find the specified channel, please try again");

        guild
            .setWelcomeChannel(givenChannel.id)
            .then(() => {
                channel.success(`Successfully updated welcome channel to <#${givenChannel.id}> channel`);
            })
            .catch((err) => {
                console.error(err);
                channel.error("There was an unexpected error while updating welcome channel, please try again");
            });
    }
};
