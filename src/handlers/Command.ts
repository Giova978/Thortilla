import { ICommand, IOptionsCommand } from "../Utils";
import { Message, PermissionResolvable, Snowflake, Collection } from "discord.js";
import Toogleable from "./Toggleable";
import TextChannelCS from "../modules/discord/TextChannel";

export default class Command extends Toogleable implements ICommand {
    public name: string;
    public aliases?: string[];
    public permissions?: PermissionResolvable[];
    public category: string;
    public description: string;
    public usage: string;
    public cooldowns: Collection<string, number>;
    public cooldown: number;
    public permissionsMe?: PermissionResolvable[];

    constructor(name: string, options: IOptionsCommand) {
        super();

        this.name = name;
        this.cooldowns = new Collection();
        this.cooldown = 4;

        if (options.cooldown && !isNaN(options.cooldown!)) this.cooldown = options.cooldown;
        if (Array.isArray(options.aliases) && options.aliases.length != 0) this.aliases = options.aliases;
        if (Array.isArray(options.permissions) && options.permissions.length != 0) this.permissions = options.permissions;
        if (Array.isArray(options.permissionsMe) && options.permissionsMe.length != 0) this.permissionsMe = options.permissionsMe;

        this.category = options.category;
        this.description = options.description;
        this.usage = options.usage;
    }

    public run(message: Message, args: string[], channel: TextChannelCS) {
        throw new Error(`${this.name} doesnt have a method `);
    }
}