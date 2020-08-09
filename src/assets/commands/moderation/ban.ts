import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import { MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super('ban', {
            permissions: ["BAN_MEMBERS"],
            category: 'moderation',
            description: 'Ban a user',
            usage: '<user> [reason]',
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const member: GuildMember | undefined = Utils.getMember(message, args[0]);
        if (!member) return channel.error(`I couldn't find ${args[0]}`);
        if (!member.bannable) return channel.error(`I can't ban <@${member.id}>`);

        args.shift();

        let reason = args.join(' ');
        if (!reason) reason = 'No reason specified';

        const admin = await message.guild?.members.fetch(message.author.id);

        await member.ban({
            reason
        });

        const embed = new MessageEmbed()
            .setTitle('Ban')
            .setColor('RED')
            .addField('Banned by: ', `<@${admin?.id}>`)
            .addField('Banned: ', `<@${member.id}>`)
            .addField('Reason: ', reason)
            .addField('Date: ', new Date);

        message.channel.send(embed);
    }
}