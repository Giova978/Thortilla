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
        super("ban", {
            permissions: ["BAN_MEMBERS"],
            permissionsMe: ["BAN_MEMBERS"],
            category: "moderation",
            description: "Ban a user",
            usage: "<user> [reason]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const member = Utils.getMember(message, args[0]);
        if (!member) return channel.error(`I couldn't find the user`);
        if (message.member!.roles.highest.comparePositionTo(member?.roles.highest) <= 0)
            return channel.error(`You can't kick <@${member.id}>`);
        if (!member.bannable) return channel.error(`I can't ban <@${member.id}>`);

        args.shift();

        let reason = args.join(" ");
        if (!reason) reason = "No reason specified";

        const admin = message.member;

        await member.ban({
            reason,
        });

        const embed = new MessageEmbed()
            .setTitle("Ban")
            .setColor("RED")
            .addField("Banned by: ", `<@${admin?.id}>`)
            .addField("Banned: ", `<@${member.id}>`)
            .addField("Reason: ", reason)
            .addField("Date: ", new Date());

        message.channel.send(embed);

        (message.guild as GuildDB).sendLog("ban", {
            bannedBy: admin!,
            bannedMember: member,
            date: new Date(),
            reason,
        });
    }
};
