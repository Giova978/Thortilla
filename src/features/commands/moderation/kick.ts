import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import { MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("kick", {
            permissions: ["KICK_MEMBERS"],
            permissionsMe: ["KICK_MEMBERS"],
            category: "moderation",
            description: "Kick a user",
            usage: "<user> [reason]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const member = Utils.getMember(message, args[0]);
        if (!member) return channel.error(`I couldn't find the user`);
        if (message.member!.roles.highest.comparePositionTo(member?.roles.highest) <= 0)
            return channel.error(`You can't kick <@${member.id}>`);
        if (!member.bannable) return channel.error(`I can't kick <@${member.id}>`);

        args.shift();

        let reason = args.join(" ");
        if (!reason) reason = "No reason specified";

        const admin = message.member;

        await member.kick(reason);

        const embed = new MessageEmbed()
            .setTitle("Kick")
            .setColor("RED")
            .addField("Kicked by: ", `<@${admin?.id}>`)
            .addField("Kicked: ", `<@${member.id}>`)
            .addField("Reason: ", reason)
            .addField("Date: ", new Date());

        message.channel.send(embed);

        (message.guild as GuildDB).sendLog("kick", {
            kickedMember: member,
            kickedBy: admin!,
            date: new Date(),
            reason,
        });
    }
};
