import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import { MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super('kick', {
            permissions: ["KICK_MEMBERS"],
            permissionsMe: ["KICK_MEMBERS"],
            category: 'moderation',
            description: 'Kick a user',
            usage: '<user> [reason]',
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const member: GuildMember | undefined = Utils.getMember(message, args[0]);
        if (!member) return channel.error(`I couldn't find the user`);
        if (member.roles.highest.comparePositionTo(message.member?.roles.highest!) < 0) return channel.error(`You can't kick <@${member.id}>`);
        if (!member.bannable) return channel.error(`I can't kick <@${member.id}>`);

        args.shift();

        let reason = args.join(' ');
        if (!reason) reason = 'No reason specified';

        const admin = await message.guild?.members.fetch(message.author.id);

        await member.ban({
            reason
        });

        const embed = new MessageEmbed()
            .setTitle('Kick')
            .setColor('RED')
            .addField('Kicked by: ', `<@${admin?.id}>`)
            .addField('Kicked: ', `<@${member.id}>`)
            .addField('Reason: ', reason)
            .addField('Date: ', new Date);

        message.channel.send(embed);
    }
}