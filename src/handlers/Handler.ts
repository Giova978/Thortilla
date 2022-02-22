import { Client, ClientEvents, Collection } from "discord.js";
import { Manager, NodeOptions } from "erela.js";
import { Utils } from "../Utils";
import Command from "./Command";
import Event from "./Event";
import Player from "./Player";
import pino from "pino";

export default class Handler {
    public client: Client;
    public prefix: string;
    public prefixes: Collection<string, string> = new Collection();
    public categories: string[];
    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public events: Collection<keyof ClientEvents, Event[]> = new Collection();
    public logger: pino.Logger;
    public permissions = {
        ADMINISTRATOR: {
            english: "Administrator",
        },
        CREATE_INSTANT_INVITE: {
            english: "Create Invite",
        },
        KICK_MEMBERS: {
            english: "Kick Members",
        },
        BAN_MEMBERS: {
            english: "Ban Members",
        },
        MANAGE_CHANNELS: {
            english: "Manage Channels",
        },
        VIEW_AUDIT_LOG: {
            english: "View Audit Log",
        },
        PRIORITY_SPEAKER: {
            english: "Priority Speaker",
        },
        STREAM: {
            english: "Stream",
        },
        VIEW_CHANNEL: {
            english: "View Channel",
        },
        SEND_MESSAGES: {
            english: "Send Messages",
        },
        MANAGE_MESSAGES: {
            english: "Manage Messages",
        },
        CONNECT: {
            english: "Connect To Voice Channel",
        },
        SPEAK: {
            english: "Speak In Voice Channel",
        },
        MANAGE_ROLES: {
            english: "Manage Roles",
        },
        ADD_REACTIONS: {
            english: "Add Reactions",
        },
        MANAGE_GUILD: {
            english: "Manage Guild",
        },
    };
    // Initialized in ready event
    public player!: Player;
    public manager!: Manager;

    public nodes: NodeOptions[] = [
        {
            host: process.env.LAVALINK!,
            port: parseInt(process.env.PORTLAVA!),
            password: process.env.LAVAPASS!,
        },
    ];

    constructor(client: Client, prefix: string, categories: string[]) {
        this.client = client;
        this.categories = categories;
        this.prefix = prefix;

        this.logger = pino({
            prettyPrint: {
                colorize: true,
                translateTime: "yyyy-mm-dd HH:MM:ss",
                ignore: "hostname,pid",
            },
        });
    }

    public load(directory: any, args: object) {
        const files = Utils.readdirSyncRecursive(directory)
            .filter((file) => file.endsWith(".js"))
            .map(require);

        files.forEach((File) => {
            if (File.prototype instanceof Command) {
                const command = new File(args);
                this.loadCommand(command);
            }
        });

        files.forEach((File) => {
            if (File.prototype instanceof Event) {
                const event = new File(args);
                this.loadEvent(event);
            }
        });

        this.registerEvents();
    }

    public reloadCommand(command: Command) {
        if (this.commands.has(command.name)) {
            const oldCommand = this.commands.get(command.name);
            this.commands.delete(command.name);

            if (oldCommand!.aliases && Array.isArray(oldCommand!.aliases)) {
                oldCommand!.aliases.forEach((alias) => {
                    this.aliases.delete(alias);
                });
            }
        }

        this.loadCommand(command);
    }

    private loadCommand(command: Command) {
        if (this.commands.has(command.name) || this.aliases.has(command.name)) {
            throw new Error(`This command name (${command.name}) is in use`);
        }

        this.commands.set(command.name, command);

        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach((alias) => {
                if (this.commands.has(alias) || this.aliases.has(alias))
                    throw new Error(`The ${alias} in command ${command.name} is already in use by other command`);
                this.aliases.set(alias, command);
            });
        }
    }

    private loadEvent(event: Event) {
        const events = this.events.get(event.eventName) || [];
        events.push(event);

        this.events.set(event.eventName, events);
    }

    // Resgister the events
    private registerEvents() {
        for (const [eventName, events] of Array.from(this.events)) {
            this.client.on(eventName, async (...args: ClientEvents[typeof eventName]) => {
                events.map((event) => {
                    if (!event.enabled) return;
                    event.run(...args);
                });
            });
        }
    }
}
