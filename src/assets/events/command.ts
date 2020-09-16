import Event from "../../handlers/Event";
import { Client, Message, DMChannel } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "../../modules/discord/Guild";
import Command from "../../handlers/Command";
import TextChannelCS from "../../modules/discord/TextChannel";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("message", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run(message: Message) {

        if (!message.guild) return;

        const guild: GuildDB = message.guild as GuildDB;
        const prefix: string = guild.getPrefix;
        const channel = message.channel as TextChannelCS;

        if (message.mentions.has(this.client.user!) && !message.mentions.everyone && !message.content.startsWith(prefix)) {
            message.mentions.members?.delete(this.client.user!.id);
            message.content = prefix + message.content.slice(this.client.user!.id.length + 4).trim();
        }

        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const [command, ...args] = message.content.slice(prefix.length).split(" ");

        let cmd: Command | undefined = this.handler.commands.get(command!.toLocaleLowerCase()) || this.handler.aliases.get(command!.toLocaleLowerCase());

        // Use to look if the bot and the GuildMember has the required permissions
        let hasPermission = false;
        const modules = guild.getModulesStatus;

        if (!cmd || !cmd.enabled || !modules[cmd.category]) {
            return;
        }

        if (cmd.permissionsMe) {
            for (const perm of cmd.permissionsMe) {
                if (message.guild.me?.hasPermission(perm)) {
                    hasPermission = true
                    break;
                }
            }
        } else {
            hasPermission = true
        }

        // @ts-ignore
        const permissionsMe = cmd.permissionsMe?.map((permission) => `\`${this.handler.permissions[permission].english}\` `);
        if (!hasPermission) return channel.info(`I don't have the required permissions, I need ${permissionsMe?.join(' ')}`);
        hasPermission = false;

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

        // @ts-ignore
        const permissions = cmd.permissions?.map((permission) => `\`${this.handler.permissions[permission].english}\` `);
        if (!hasPermission) return channel.info(`You don't have the required permissions, you need ${permissions}`);

        const now = (new Date).getTime()
        if (cmd.cooldowns.has(message.author.id)) {
            const cooldown = cmd.cooldowns.get(message.member!.id);
            const leftCooldown = `${Math.floor(cooldown! - now) / 1000}`.substring(0, 3);

            if (now < cooldown!) return channel.error(`You have to wait ${leftCooldown}`);
        }

        cmd.cooldowns.set(message.author.id, now + cmd.cooldown * 1000);

        cmd.run(message, args, channel);
    }
};
