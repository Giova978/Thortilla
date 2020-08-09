import Event from "../../handlers/Event";
import { Client, Message, DMChannel } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "../../modules/discord/Guild";
import Command from "../../handlers/Command";
import TextChannelCS from "../../modules/discord/TextChannel";
import NewsChannelCS from "../../modules/discord/NewsChannel";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("message", "required");

        this.client = client;
        this.handler = handler;
    }

    public run(message: Message) {

        if (!message.guild) return;

        const guild: GuildDB = message.guild as GuildDB;
        const prefix: string = guild.getPrefix;
        const channel = message.channel as TextChannelCS;

        if (message.mentions.has(this.client.user!) && !message.mentions.everyone) {
            if (message.member?.hasPermission("ADMINISTRATOR")) {
                message.content = prefix + message.content.slice(this.client.user!.id.length + 4).trim();
            } else {
                return message.channel.send(`The prefix is \`${prefix}\``);
            }
        }

        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const [command, ...args] = message.content.slice(prefix.length).split(" ");

        let cmd: Command | undefined = this.handler.commands.get(command!.toLocaleLowerCase()) || this.handler.aliases.get(command!.toLocaleLowerCase());

        let hasPermission: boolean = false;
        const modules = guild.getModulesStatus;

        if (!cmd || !cmd.enabled || !modules[cmd.category]) {
            return;
        }

        if (cmd.permissions) {
            for (const perm of cmd.permissions) {
                if (message.member?.hasPermission(perm)) {
                    hasPermission = true;
                    break;
                }
            }
        } else {
            hasPermission = true;
        }

        if (!hasPermission) return message.channel.send("You don't have the required permissions");

        const now = (new Date).getTime()
        if (cmd.cooldowns.has(message.author.id)) {
            const cooldown = cmd.cooldowns.get(message.member!.id);
            const leftCooldown = `${Math.floor(cooldown! - now) / 1000}`.substring(0, 3);

            if (now < cooldown!) return message.channel.send(`You have to wait ${leftCooldown}`);
        }

        cmd.cooldowns.set(message.author.id, now + cmd.cooldown * 1000);

        cmd.run(message, args, channel);
    }
};
