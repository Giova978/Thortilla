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
const Utils_1 = require("../../../Utils");
const discord_js_1 = require("discord.js");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('addrole', {
            aliases: ['adrole', 'adr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Adds a role to the given user',
            usage: '<user> <role name>',
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = Utils_1.Utils.getMember(message, args.shift());
            if (!user)
                return this.handler.error('Give me a user please', message.channel);
            const role = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find(role => role.name === args.join(' '));
            if (!role)
                return this.handler.error('Give me a valid role name please', message.channel);
            if (user.roles.cache.has(role.id))
                return this.handler.error(`The user has already ${role.name} role`, message.channel);
            user.roles.add(role);
            const embed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setTitle('**Role Added**')
                .setDescription(`**${role.name}** has been succesfully added to **<@!${user.id}>**`);
            message.channel.send(embed);
        });
    }
};
