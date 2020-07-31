"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!message.guild)
                return;
            const guild = message.guild;
            const prefix = guild.getPrefix;
            console.log(prefix);
            if (message.mentions.has(this.client.user) && !message.mentions.everyone) {
                if ((_a = message.member) === null || _a === void 0 ? void 0 : _a.hasPermission("ADMINISTRATOR")) {
                    message.content = prefix + message.content.slice(this.client.user.id.length + 4).trim();
                }
                else {
                    return message.channel.send(`The prefix is \`${prefix}\``);
                }
            }
            if (message.author.bot || !message.content.startsWith(prefix))
                return;
            const [command, ...args] = message.content.slice(prefix.length).split(" ");
            let cmd = this.commands.get(command.toLocaleLowerCase()) || this.aliases.get(command.toLocaleLowerCase());
            let hasPermission = false;
            const modules = guild.getModulesStatus;
            if (!cmd || !cmd.enabled || !modules[cmd.category]) {
                return;
            }
            if (cmd.permissions) {
                for (const perm of cmd.permissions) {
                    if ((_b = message.member) === null || _b === void 0 ? void 0 : _b.hasPermission(perm)) {
                        hasPermission = true;
                        break;
                    }
                }
            }
            else {
                hasPermission = true;
            }
            if (!hasPermission)
                return message.channel.send("You don't have the required permissions");
            const now = (new Date).getTime();
            if (cmd.cooldowns.has(message.author.id)) {
                const cooldown = cmd.cooldowns.get(message.member.id);
                const leftCooldown = `${Math.floor(cooldown - now) / 1000}`.substring(0, 3);
                if (now < cooldown)
                    return message.channel.send(`You have to wait ${leftCooldown}`);
            }
            cmd.cooldowns.set(message.author.id, now + cmd.cooldown * 1000);
            cmd.run(message, args);
        }));
    }
}
exports.default = Handler;
