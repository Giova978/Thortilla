import Command from "../../../handlers/Command";
import { Message, GuildMember, Role, MessageEmbed } from "discord.js";
import { Utils } from "../../../Utils";

module.exports = class extends Command {
    
    constructor() {
        super('removerole',{
            aliases: ['revrole','rr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Remove a role from the given user',
            usage: '<use> <role name>',
        });
    }

    public async run(message: Message, args: string[]) {
        const user: GuildMember | undefined = Utils.getMember(message, args.shift());
        if (!user) return message.channel.send('Give me a user please').then(Utils.deleteMessage);

        const role: Role | undefined = message.guild?.roles.cache.find(role => role.name === args.join(' '));
        if (!role) return message.channel.send('Give me a valid role name please').then(Utils.deleteMessage);

        if (!user.roles.cache.has(role.id)) return message.channel.send(`The user doesn\'t has the \`${role.name}\` role`).then(Utils.deleteMessage);

        user.roles.remove(role);

        const embed: MessageEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('**Role Added**')
        .setDescription(`**${role.name}** has been succesfully removed from **<@!${user.id}>**`);

        message.channel.send(embed);
    }
}