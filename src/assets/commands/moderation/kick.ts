import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils } from "../../../Utils";
import { MessageEmbed } from "discord.js";

module.exports = class extends Command {
    
    constructor() {
        super('kick',{
            permissions: ["KICK_MEMBERS"],
            category: 'moderation',
            description: 'Bans a user',
            usage: '<user> [reason]',
        });
    }

    public async run(message: Message, args: string[]) {
        const member: GuildMember | undefined = Utils.getMember(message,args[0]);
        if (!member) return message.channel.send(`I couldn't find ${args[0]}`).then(Utils.deleteMessage)
        if (!member.bannable) return message.channel.send(`I can't kick ${member.displayName}`).then(Utils.deleteMessage)

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