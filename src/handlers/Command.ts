import { ICommand, IOptionsCommand } from "../Utils";
import { Message, PermissionResolvable } from "discord.js";
import Toogleable from "./Toggleable";

export default class Command extends Toogleable implements ICommand {
    public name: string;
    public aliases?: string[];
    public permissions?: PermissionResolvable[];
    public category: string;
    public description: string;
    public usage: string;

    constructor(name: string, options: IOptionsCommand) {
        super();

        this.name = name;

        if (Array.isArray(options.aliases) && options.aliases.length != 0) this.aliases = options.aliases;
        if (Array.isArray(options.permissions) && options.permissions.length != 0) this.permissions = options.permissions;

        this.category = options.category;
        this.description = options.description;
        this.usage = options.usage;
    }

    public run(message: Message, args: string[]) {
        throw new Error(`${this.name} doesnt have a method `);
    }
}