"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Toggleable_1 = __importDefault(require("./Toggleable"));
class Command extends Toggleable_1.default {
    constructor(name, options) {
        super();
        this.name = name;
        this.cooldowns = new discord_js_1.Collection();
        this.cooldown = 4;
        if (options.cooldown && !isNaN(options.cooldown))
            this.cooldown = options.cooldown;
        if (Array.isArray(options.aliases) && options.aliases.length != 0)
            this.aliases = options.aliases;
        if (Array.isArray(options.permissions) && options.permissions.length != 0)
            this.permissions = options.permissions;
        this.category = options.category;
        this.description = options.description;
        this.usage = options.usage;
    }
    run(message, args) {
        throw new Error(`${this.name} doesnt have a method `);
    }
}
exports.default = Command;
