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

        channel.send(message);
    }
};
