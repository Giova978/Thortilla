"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Utils_1 = require("../Utils");
const Command_1 = __importDefault(require("./Command"));
const Event_1 = __importDefault(require("./Event"));
class Handler {
    constructor(client, prefix, categories) {
        this.prefixes = new discord_js_1.Collection();
        this.commands = new discord_js_1.Collection();
        this.aliases = new discord_js_1.Collection();
        this.events = new discord_js_1.Collection();
        this.nodes = [
            {
                host: process.env.LAVALINK,
                port: process.env.PORTLAVA,
                password: process.env.LAVAPASS,
            },
        ];
        this.client = client;
        this.categories = categories;
        this.prefix = prefix;
    }
    load(directory, args) {
        const files = Utils_1.Utils.readdirSyncRecursive(directory)
            .filter((file) => file.endsWith(".js"))
            .map(require);
        files.forEach((File) => {
            if (File.prototype instanceof Command_1.default) {
                const command = new File(args);
                this.loadCommand(command);
            }
        });
        files.forEach((File) => {
            if (File.prototype instanceof Event_1.default) {
                const event = new File(args);
                this.loadEvent(event);
            }
        });
        this.registerEvents();
    }
    loadCommand(command) {
        if (this.commands.has(command.name) || this.aliases.has(command.name)) {
            throw new Error(`This command name (${command.name}) is in use`);
        }
        this.commands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach((alias) => {
                if (this.commands.has(alias) || this.aliases.has(alias))
                    throw new Error(`The ${alias} is already in use by other command`);
                this.aliases.set(alias, command);
            });
        }
    }
    loadEvent(event) {
        const events = this.events.get(event.eventName) || [];
        events.push(event);
        this.events.set(event.eventName, events);
    }
    // Resgister the events
    registerEvents() {
        for (const [eventName, events] of Array.from(this.events)) {
            // @ts-ignore
            this.client.on(eventName, (...args) => {
                events.map((event) => {
                    if (!event.enabled)
                        return;
                    event.run(...args);
                });
            });
        }
    }
    error(text, channel, timeout = 5000) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor('RED')
            .addField('Error', `\`${text}\``);
        channel.send(embed).then((msg) => msg.delete({ timeout }));
    }
}
exports.default = Handler;
