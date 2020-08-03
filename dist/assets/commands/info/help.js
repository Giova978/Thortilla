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
const Command_1 = __importDefault(require("../../../handlers/Command"));
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('help', {
            aliases: ['info', 'h'],
            category: 'info',
            description: 'Send the commands or info about a command',
            usage: '[command]',
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandName = args[0];
            if (!commandName)
                return message.channel.send(this.getAll());
            const command = this.handler.commands.get(args[0]) || this.handler.aliases.get(args[0]);
            if (!command || command.category === "debug")
                return this.handler.error(`No info found about \`${commandName}\``, message.channel);
            message.channel.send(this.getCmd(command));
        });
    }
    getCmd(command) {
        var _a;
        const aliases = ((_a = command.aliases) === null || _a === void 0 ? void 0 : _a.map(alias => `\`${alias}\``).join(' ')) || '__';
        const embed = new discord_js_1.MessageEmbed()
            .setColor('GREEN')
            .setTitle('Command')
            .setDescription(common_tags_1.stripIndents `
            **Name:** ${command.name}
            **Aliases:** ${aliases}
            **Description:** ${command.description}
            **Usage:** ${command.usage}
            **Is enabled:** ${command.enabled}
        `)
            .setFooter('Syntax: <> = required, [] = optional');
        return embed;
    }
    getAll() {
        const commands = (category) => {
            return this.handler.commands
                .filter(cmd => cmd.category === category && cmd.category !== 'debug')
                .filter(cmd => cmd.enabled === true)
                .map(cmd => `- \`${cmd.name}\``)
                .join('\n');
        };
        const info = this.handler.categories
            .map(category => common_tags_1.stripIndents `**${category.charAt(0).toLocaleUpperCase() + category.slice(1)}**\n${commands(category)}`)
            .join('\n');
        const embed = new discord_js_1.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Commands')
            .setDescription(info);
        return embed;
    }
};
