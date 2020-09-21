import { IArgs } from "../../Utils";
import Event from "../../handlers/Event";
import Handler from "../../handlers/Handler";
import { Message } from "discord.js";
import GuildDB from "@/modules/discord/Guild";
import TextChannelCS from "@/modules/discord/TextChannel";

module.exports = class extends Event {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("message", "tags");

        this.handler = handler;
    }

    public async run(message: Message) {
        const guild: GuildDB = message.guild as GuildDB;
        const channel = message.channel as TextChannelCS;

        if (!message.content.startsWith(guild.getTagPrefix)) return;

        const tagName = message.content.slice(1).split(" ")[0];
        const tag = guild.tags.get(tagName);

        if (!tag) return channel.error("Give me a valid tag name", 1000);

        channel.send(tag);
    }
};
