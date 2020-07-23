import Command from "../../../handlers/Command";
import { Message, GuildMember, Role, MessageEmbed } from "discord.js";
import { Utils } from "../../../Utils";
import { stripIndent } from "common-tags";
import MemberDB from "../../../modules/discord/Member";

module.exports = class extends Command {

    constructor() {
        super('userinfo',{
            aliases: ['whois', 'id'],
            category: 'info',
            description: 'Send the user info',
            usage: '[user]',
        });
    }

    public async run(message: Message, args: string[]) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        let roles: string[] | undefined = member?.roles.cache.map((role: Role) => `\`${role.name}\``);
        // Remove @everyone from roles
        roles?.pop();
        if (!roles?.length) roles = ['None'];

        const embed: MessageEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('User Info')
        .setThumbnail(member!.user.displayAvatarURL({ dynamic: false }))
        .setDescription(stripIndent`
            **Username:** ${member?.user.username}
            **Nickname:** ${member?.nickname || 'None'}
            **Identifier:** #${member?.user.discriminator}
            **Roles:** ${roles?.join(' ')}
            **Account Created At:** ${Utils.formatTimestamp(member?.user.createdAt)}
            **Joined At:** ${Utils.formatTimestamp(member?.joinedAt)}
            [**Avatar UR**](${member!.user.displayAvatarURL({ dynamic: false })})
            **Balance:** ${member.getBalance()} coins 
            `);
        message.channel.send(embed);
    }
}