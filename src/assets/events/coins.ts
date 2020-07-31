import Event from "../../handlers/Event";
import { Client, Message, MessageEmbed } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs, Utils } from "../../Utils";
import GuildDB from "../../modules/discord/Guild";
import MemberDB from "../../modules/discord/Member";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("message", "balance");

        this.client = client;
        this.handler = handler;
    }

    public run(message: Message) {
        const guild: GuildDB = message.guild as GuildDB;

        if (!guild.getModulesStatus.balance) return;

        if (!message.content.startsWith(guild.getPrefix) && !message.author.bot) {
            const member: MemberDB = message.member as MemberDB;

            const chance = !!0.4 && Math.random() <= 0.4;

            if (chance) {
                const coinsAdd = Math.floor(Math.random() * (30 - 5) + 5);

                member.updateBalance(coinsAdd);

                const embed = new MessageEmbed().setColor("YELLOW").setDescription(`${message.author} you earned ${coinsAdd} coins`);

                message.channel.send(embed).then((msg) => Utils.deleteMessage(msg, 2000));
            }
        }
    }
};
