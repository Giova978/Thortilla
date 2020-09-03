import Event from "../../handlers/Event";
import { Client, Guild } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import { stripIndents } from "common-tags";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("guildCreate", "required");

        this.client = client;
        this.handler = handler;
    }

    public run(guild: Guild) {
        const text = stripIndents`
        Thanks for adding me
        - My prefix is **$**
        - You can change it by doing $setprefix
        - If my prefix conflicts with other bot you can mention me and execute commands
        - $help for a list of commands, you can get detailed info with $info <command>
        `

        const channels = guild.channels.cache.filter(channel => channel.type === 'text');

        this.sendMessage(channels, text);
    }

    private sendMessage(channels: any, text: string) {
        channels.first().send(text)
            .then()
            .catch(() => {
                channels.delete(channels.firstKey())
                this.sendMessage(channels.shift(), text)
            });
    }
}