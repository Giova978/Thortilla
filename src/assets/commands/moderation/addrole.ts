import Command from "../../../handlers/Command";
import { IArgs, Utils } from "../../../Utils";
import { Message, Role, GuildMember, MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super('addrole', {
            aliases: ['adrole', 'adr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Adds a role to the given user',
            usage: '<user> <role name>',
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const user: GuildMember | undefined = Utils.getMember(message, args.shift());
        if (!user) return channel.error('Give me a user please');

        const role: Role | undefined = message.guild?.roles.cache.find(role => role.name === args.join(' '));
        if (!role) return channel.error('Give me a valid role name please');

        if (user.roles.cache.has(role.id)) return channel.error(`The user has already ${role.name} role`);

        user.roles.add(role);

        const embed: MessageEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('**Role Added**')
            .setDescription(`**${role.name}** has been succesfully added to **<@!${user.id}>**`);

        message.channel.send(embed);
    }
}