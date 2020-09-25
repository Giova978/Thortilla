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

    public async run(guild: Guild) {
        const text = stripIndents`
        Thanks for adding me
        - My prefix is **$**, you can change it with \`$setprefix\`
        - If my prefix conflicts with other bot you can mention me and execute commands
        - Use \`$help\` for a list of commands, you can get detailed info with \`$info <command>\`
        `

        // @ts-ignore
        const firstChannel = guild!.channels.cache.sort((ch1, ch2) => ch1.position < ch2.position ? -1 : 1).find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
        // @ts-ignore
        firstChannel!.send(text);
    }
}