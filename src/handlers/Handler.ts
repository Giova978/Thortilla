import { Client, Collection, Message, MessageEmbed, Channel, TextChannel, DMChannel, NewsChannel } from "discord.js";
import { LavaClient } from "@anonymousg/lavajs";
import { Utils } from "../Utils";
import Command from "./Command";
import Event from "./Event";
import Player from "./Player";
import GuildDB from "../modules/discord/Guild";

export default class Handler {
    public client: Client;
    public prefix: string;
    public prefixes: Collection<string, string> = new Collection();
    public categories: string[];
    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public events: Collection<string, Event[]> = new Collection();
    // @ts-ignore
    public player: Player;
    // @ts-ignore
    public lavaClient: LavaClient;
    public nodes = [
        {
            host: process.env.LAVALINK,
            port: process.env.PORTLAVA,
            password: process.env.LAVAPASS,
        },
    ];

    constructor(client: Client, prefix: string, categories: string[]) {
        this.client = client;
        this.categories = categories;
        this.prefix = prefix;
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

    private loadCommand(command: Command) {
        if (this.commands.has(command.name) || this.aliases.has(command.name)) {
            throw new Error(`This command name (${command.name}) is in use`);
        }

        this.commands.set(command.name, command);

        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach((alias) => {
                if (this.commands.has(alias) || this.aliases.has(alias)) throw new Error(`The ${alias} is already in use by other command`);
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
            // @ts-ignore
            this.client.on(eventName, (...args: any) => {
                events.map((event) => {
                    if (!event.enabled) return;
                    event.run(...args);
                });
            });
        }
    }
}
