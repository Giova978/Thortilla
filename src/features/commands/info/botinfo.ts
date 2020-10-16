import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import TextChannelCS from "../../../models/discord/TextChannel";
import { stripIndents } from "common-tags";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("botinfo", {
            aliases: ["bothelp"],
            category: "info",
            description: "Send bot's info",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const embed = new MessageEmbed().setTitle("Bot info").setColor("GREEN").setDescription(stripIndents`
            Currently in ${this.handler.client.guilds.cache.size} guilds with ${this.handler.client.guilds.cache.reduce(
            (acc, guild) => acc + guild.members.cache.size,
            0,
        )} members
            [Invite me to your guild](${await this.handler.client.generateInvite(["ADMINISTRATOR"])})
            [Website](http://thortilla.giova.software)
            `);

        channel.send(embed);
    }
};
