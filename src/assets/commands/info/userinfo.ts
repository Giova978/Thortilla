import Command from "../../../handlers/Command";
import { Message, GuildMember, Role, MessageEmbed } from "discord.js";
import { Utils } from "../../../Utils";
import { stripIndent } from "common-tags";
import MemberDB from "../../../modules/discord/Member";

module.exports = class extends Command {
    constructor() {
        super("userinfo", {
            aliases: ["whois", "id"],
            category: "info",
            description: "Send the user info",
            usage: "[user]",
        });
    }

    public async run(message: Message, args: string[]) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        let roles: string[] | undefined = member?.roles.cache.map((role: Role) => `<@&${role.id}>`);
        // Remove @everyone from roles
        roles?.pop();
        if (!roles?.length) roles = ["None"];

        const embed: MessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("User Info")
            .addField("**Username**", member?.user.username, true)
            .addField("**Nickname**", member?.nickname || "None", true)
            .addField("**Identifier**", `#${member?.user.discriminator}`, true)
            .addField("**Account Created At**", Utils.formatTimestamp(member?.user.createdAt), true)
            .addField("**Joined At**", Utils.formatTimestamp(member?.joinedAt), true)
            .addField("**Roles**", roles.join(" "))
            .addField("**Avatar**", `[**Avatar URL**](${member!.user.displayAvatarURL({ dynamic: false })})`, true)
            .addField("**Balance**", `${member.getBalance} coins`, true)
            .setThumbnail(member!.user.displayAvatarURL({ dynamic: false }));

        message.channel.send(embed);
    }
};
