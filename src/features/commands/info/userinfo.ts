import Command from "../../../handlers/Command";
import { Message, GuildMember, Role, MessageEmbed } from "discord.js";
import { Utils } from "../../../Utils";
import { stripIndent } from "common-tags";
import MemberDB from "../../../models/discord/Member";

module.exports = class extends Command {
    constructor() {
        super("userinfo", {
            aliases: ["whois", "id"],
            category: "info",
            description: "Send user info like balance, pfp and id",
            usage: "[user]",
        });
    }

    public async run(message: Message, args: string[]) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        let userRoles: string[] | undefined = member?.roles.cache.map((role: Role) => `<@&${role.id}>`);
        // Remove @everyone from roles
        userRoles?.pop();
        if (!userRoles?.length) userRoles = ["None"];

        let roles = userRoles.reduce((acc: string, val: string, index) => {
            return `${acc} ${val}`.length >= 1024 ? acc : `${acc} ${val}`;
        });

        if (roles.split(" ").length !== userRoles.length) {
            roles = roles + `${userRoles.slice(roles.split(" ").length).length} more`;
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("User Info")
            .addField("**Username**", member?.user.username, true)
            .addField("**Nickname**", member?.nickname || "None", true)
            .addField("**Identifier**", `#${member?.user.discriminator}`, true)
            .addField("**Account Created At**", Utils.formatTimestamp(member?.user.createdAt), true)
            .addField("**Joined At**", Utils.formatTimestamp(member?.joinedAt), true)
            .addField("**Roles**", roles)
            .addField("**Avatar**", `[**Avatar URL**](${member!.user.displayAvatarURL({ dynamic: false })})`, true)
            .addField("**Balance**", `${member.getBalance} coins`, true)
            .setThumbnail(member!.user.displayAvatarURL({ dynamic: false }));

        message.channel.send(embed);
    }
};
