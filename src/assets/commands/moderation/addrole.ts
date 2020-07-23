import Command from "../../../handlers/Command";
import { IArgs, Utils } from "../../../Utils";
import { Message, Role, GuildMember, MessageEmbed } from "discord.js";

module.exports = class extends Command {
    
    constructor() {
        super('addrole',{
            aliases: ['adrole', 'adr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Adds a role to the given user',
            usage: '<user> <role name>',
        });
    }

    public async run(message: Message, args: string[]) {
        const user: GuildMember | undefined = Utils.getMember(message, args.shift());
        if (!user) return message.channel.send('Give me a user please').then(Utils.deleteMessage);

        const role: Role | undefined = message.guild?.roles.cache.find(role => role.name === args.join(' '));
        if (!role) return message.channel.send('Give me a valid role name please').then(Utils.deleteMessage);

        if (user.roles.cache.has(role.id)) return message.channel.send(`The user has already ${role.name} role`).then(Utils.deleteMessage);

        user.roles.add(role);

        const embed: MessageEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('**Role Added**')
        .setDescription(`**${role.name}** has been succesfully added to **<@!${user.id}>**`);

        message.channel.send(embed);
    }    
}