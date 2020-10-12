import Event from "../../handlers/Event";
import { Client, GuildMember, TextChannel } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("guildMemberAdd", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run(member: GuildMember) {
        if (member.user.bot) return;
        const guild: GuildDB = member.guild as GuildDB;

        const channel = guild.channels.resolve(guild.getWelcomeChannel) as TextChannel;
        if (!channel) return;

        const message = guild.getWelcomeMessage
            .replace("{user}", member.user.username)
            .replace("{user-mention}", `<@${member.id}>`)
            .replace("{server}", member.guild.name);

        const channels = guild.getWelcomeMessage.match(/({#:)(\w+)(})/g);

        if (channels) {
            channels.map((channel) => {
                const fetchChannel = guild.channels.cache.find((ch) => ch.name === channel[2] || ch.id === channel[2]);
                if (!fetchChannel) return message.replace(channel[0], "");

                message.replace(channel[0], `<#${fetchChannel?.id}>`);
            });
        }

        channel.send(message);
    }
};
