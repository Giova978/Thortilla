import Event from "../../handlers/Event";
import { Client, Message, MessageEmbed } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "../../models/discord/Guild";
import MemberDB from "../../models/discord/Member";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("message", "balance");

        this.client = client;
        this.handler = handler;
    }

    public async run(message: Message) {
        const guild = message.guild as GuildDB;

        if (!guild.getModulesStatus?.balance) return;

        if (
            !message.content.startsWith(guild.getPrefix) &&
            !message.content.startsWith(guild.getTagPrefix) &&
            !message.author.bot &&
            !message.mentions.has(this.handler.client.user!)
        ) {
            const member = message.member as MemberDB;

            const chances = [true, true, false, false, false, false, false, false, false, false];
            const chance = chances[Math.floor(Math.random() * chances.length)];

            if (chance) {
                const coinsAdd = Math.floor(Math.random() * (30 - 5) + 5);

                member.updateBalance(coinsAdd);

                const embed = new MessageEmbed()
                    .setColor("YELLOW")
                    .setDescription(`${message.author} you earned ${coinsAdd} coins`);

                message.channel.send(embed).then((msg) => msg.delete({ timeout: 1000 }));
            }
        }
    }
};
