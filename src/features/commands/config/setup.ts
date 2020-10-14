import Command from "@handlers/Command";
import { GuildChannel, Message, MessageEmbed, MessageReaction } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";
import { User } from "discord.js";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("setup", {
            permissions: ["MANAGE_GUILD"],
            category: "config",
            description: "A guide through setting up the bot",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;

        this.init(message, guild, channel, undefined);
    }

    private async init(message: Message, guild: GuildDB, channel: TextChannelCS, msgOld?: Message) {
        const logChannel = guild.channels.resolve(guild.getLogChannel) ? `<#${guild.getLogChannel}>` : "None";
        const welcomeChannel = guild.channels.resolve(guild.getWelcomeChannel)
            ? `<#${guild.getWelcomeChannel}>`
            : "None";
        const leaveChannel = guild.channels.resolve(guild.getLeaveChannel) ? `<#${guild.getLeaveChannel}>` : "None";

        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Setup")
            .addField(":one: Log Channel", logChannel)
            .addField(":two: Welcome Channel", welcomeChannel)
            .addField(":three: Leave Channel", leaveChannel)
            .addField(":four: Welcome Message", guild.getWelcomeMessage)
            .addField(":five: Leave Message", guild.getLeaveMessage)
            .setDescription(
                "React with the correct emoji to edit the desired category. React with ✅ to finish setup.\nPlease wait for all the reactions to appear before reacting",
            );

        let msg: Message;

        if (!msgOld) {
            msg = await channel.send(embed);
        } else {
            msg = await msgOld.edit(embed);
        }

        await Promise.all([
            msg.react("1️⃣"),
            msg.react("2️⃣"),
            msg.react("3️⃣"),
            msg.react("4️⃣"),
            msg.react("5️⃣"),
            msg.react("✅"),
        ]);

        const filter = (reaction: MessageReaction, user: User) =>
            user.id === message.author.id && ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "✅"].includes(reaction.emoji.name);

        const reaction = await msg.awaitReactions(filter, { time: 3 * 60 * 1000, max: 1, maxEmojis: 1 });

        const emoji = reaction.first()?.emoji.name;
        const msgFilter = (msg: Message) => msg.author.id === message.author.id;

        msg.reactions.removeAll();

        let response: Message | undefined;
        let timeout: NodeJS.Timeout;

        switch (emoji) {
            case "✅":
                const endEmbed = new MessageEmbed()
                    .setTitle("Finished setup")
                    .setColor("GREEN")
                    .setDescription("Successfully finished setup");

                msg.edit(endEmbed);

                break;
            case "1️⃣":
                const logEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Log Channel")
                    .setDescription("Reply with the new log channel or $cancel to cancel the operation");

                await msg.edit(logEmbed);

                response = (await channel.awaitMessages(msgFilter, { max: 1, time: 60 * 1000 })).first();

                const logChannel =
                    response?.mentions.channels.first() ||
                    guild.channels.resolve(response!.content) ||
                    guild.channels.cache.find((ch) => ch.name === response?.content);

                if (!logChannel && response?.content === "$cancel") {
                    logEmbed.setColor("GREEN").setTitle("Canceled Operation").setDescription("Canceled operation");

                    msg.edit(logEmbed);
                }

                if (!logChannel && response?.content !== "$cancel") {
                    logEmbed.setColor("RED").setTitle("Error").setDescription("No channel found");

                    msg.edit(logEmbed);
                }

                if (logChannel) {
                    await this.setChannel("log", guild.setLogChannel.bind(guild), logChannel, logEmbed, msg);
                }

                timeout = setTimeout(() => {
                    response?.delete();

                    this.init(message, guild, channel, msg);
                    clearTimeout(timeout);
                }, 1500);

                break;
            case "2️⃣":
                const welcomeEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Welcome Channel")
                    .setDescription("Reply with the new welcome channel or $cancel to cancel the operation");

                await msg.edit(welcomeEmbed);

                response = (await channel.awaitMessages(msgFilter, { max: 1, time: 60 * 1000 })).first();

                const welcomeChannel =
                    response?.mentions.channels.first() ||
                    guild.channels.resolve(response!.content) ||
                    guild.channels.cache.find((ch) => ch.name === response?.content);

                if (!welcomeChannel && response?.content === "$cancel") {
                    welcomeEmbed.setColor("GREEN").setTitle("Canceled Operation").setDescription("Canceled operation");

                    msg.edit(welcomeEmbed);
                }

                if (!welcomeChannel && response?.content !== "$cancel") {
                    welcomeEmbed.setColor("RED").setTitle("Error").setDescription("No channel found");

                    msg.edit(welcomeEmbed);
                }

                if (welcomeChannel) {
                    await this.setChannel(
                        "welcome",
                        guild.setWelcomeChannel.bind(guild),
                        welcomeChannel,
                        welcomeEmbed,
                        msg,
                    );
                }

                timeout = setTimeout(() => {
                    response?.delete();

                    this.init(message, guild, channel, msg);
                    clearTimeout(timeout);
                }, 1500);
                break;
            case "3️⃣":
                const leaveEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Leave Channel")
                    .setDescription("Reply with the new leave channel or $cancel to cancel the operation");

                await msg.edit(leaveEmbed);

                response = (await channel.awaitMessages(msgFilter, { max: 1, time: 60 * 1000 })).first();

                const leaveChannel =
                    response?.mentions.channels.first() ||
                    guild.channels.resolve(response!.content) ||
                    guild.channels.cache.find((ch) => ch.name === response?.content);

                if (!leaveChannel && response?.content === "$cancel") {
                    leaveEmbed.setColor("GREEN").setTitle("Canceled").setDescription("Canceled operation");

                    msg.edit(leaveEmbed);
                }

                if (!leaveChannel && response?.content !== "$cancel") {
                    leaveEmbed.setColor("RED").setTitle("Error").setDescription("No channel found");

                    msg.edit(leaveEmbed);
                }

                if (leaveChannel) {
                    await this.setChannel("leave", guild.setLeaveChannel.bind(guild), leaveChannel, leaveEmbed, msg);
                }

                timeout = setTimeout(() => {
                    response?.delete();

                    this.init(message, guild, channel, msg);
                    clearTimeout(timeout);
                }, 1500);
                break;
            case "4️⃣":
                const welcomeMessageEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Welcome Message")
                    .setDescription(
                        "Reply with the new welcome message or $cancel to cancel the operation. Use `{user}` for username, `{user-mention}` for mentioning the user, `{server}` for server name and to add a channel do {#:channel name}",
                    );

                await msg.edit(welcomeMessageEmbed);

                response = (await channel.awaitMessages(msgFilter, { max: 1, time: 60 * 1000 })).first();

                if (!response) {
                    welcomeMessageEmbed.setColor("RED").setDescription("Please give a valid message");

                    msg.edit(welcomeMessageEmbed);
                }

                if (response?.content === "$cancel") {
                    welcomeMessageEmbed.setColor("GREEN").setTitle("Canceled").setDescription("Canceled operation");

                    msg.edit(welcomeMessageEmbed);
                }

                if (response?.content && response?.content !== "$cancel") {
                    await this.setMessage(
                        "welcome",
                        guild.setWelcomeMessage.bind(guild),
                        response,
                        welcomeMessageEmbed,
                        msg,
                    );
                }

                timeout = setTimeout(() => {
                    response?.delete();

                    this.init(message, guild, channel, msg);
                    clearTimeout(timeout);
                }, 1500);
                break;
            case "5️⃣":
                const leaveMessageEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Leave Message")
                    .setDescription(
                        "Reply with the new leave message or $cancel to cancel the operation. Use `{user}` for username, `{user-mention}` for mentioning the user, `{server}` for server name and to add a channel do {#:channel name}",
                    );

                await msg.edit(leaveMessageEmbed);

                response = (await channel.awaitMessages(msgFilter, { max: 1, time: 60 * 1000 })).first();

                if (!response) {
                    leaveMessageEmbed.setColor("RED").setDescription("Please give a valid message");

                    return msg.edit(leaveMessageEmbed);
                }

                if (response?.content === "$cancel") {
                    leaveMessageEmbed.setColor("GREEN").setTitle("Canceled").setDescription("Canceled operation");

                    msg.edit(leaveMessageEmbed);
                }

                if (response?.content && response?.content !== "$cancel") {
                    await this.setMessage("leave", guild.setLeaveMessage.bind(guild), response, leaveMessageEmbed, msg);
                }

                timeout = setTimeout(() => {
                    response?.delete();

                    this.init(message, guild, channel, msg);
                    clearTimeout(timeout);
                }, 1500);
                break;
            default:
                break;
        }
    }

    private async setChannel(
        channelType: string,
        fun: (id: string) => Promise<any>,
        channel: GuildChannel,
        embed: MessageEmbed,
        msg: Message,
    ) {
        await fun(channel.id)
            .then(() => {
                embed
                    .setDescription(`Successfully updated ${channelType} channel to <#${channel.id}> channel`)
                    .setColor("GREEN");
                msg.edit(embed);
            })
            .catch((err) => {
                console.error(err);
                embed
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(
                        `There was an unexpected error while updating ${channelType} channel, please try again`,
                    );

                msg.edit(embed);
            });
    }

    private async setMessage(
        messageType: string,
        fun: (id: string) => Promise<any>,
        response: Message,
        embed: MessageEmbed,
        msg: Message,
    ) {
        await fun(response.content)
            .then(() => {
                embed.setColor("GREEN").setDescription(`Successfully updated ${messageType} message`);

                msg.edit(embed);
            })
            .catch(() => {
                embed
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(
                        `There was an unexpected error while updating ${messageType} message, please try again`,
                    );

                msg.edit(embed);
            });
    }
};
