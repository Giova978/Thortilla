import Command from "../../../handlers/Command";
import { Message, GuildMember, Role, MessageEmbed } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super('removerole', {
            aliases: ['revrole', 'rr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Remove a role from the given user',
            usage: '<use> <role name>',
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const user: GuildMember | undefined = Utils.getMember(message, args.shift());
        if (!user) return this.handler.error('Give me a user please', message.channel);
        const role: Role | undefined = message.guild?.roles.cache.find(role => role.name === args.join(' '));
        if (!role) return this.handler.error('Give me a valid role name please', message.channel);

        if (!user.roles.cache.has(role.id)) return this.handler.error(`The user doesn\'t has the \`${role.name}\` role`, message.channel);

        user.roles.remove(role);

        const embed: MessageEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('**Role Added**')
            .setDescription(`**${role.name}** has been succesfully removed from **<@!${user.id}>**`);

        message.channel.send(embed);
    }
}