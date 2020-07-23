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
const discord_js_1 = require("discord.js");
const Utils_1 = require("../../../Utils");
module.exports = class extends Command_1.default {
    constructor() {
        super('removerole', {
            aliases: ['revrole', 'rr'],
            permissions: ['MANAGE_ROLES'],
            category: 'moderation',
            description: 'Remove a role from the given user',
            usage: '<use> <role name>',
        });
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = Utils_1.Utils.getMember(message, args.shift());
            if (!user)
                return message.channel.send('Give me a user please').then(Utils_1.Utils.deleteMessage);
            const role = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find(role => role.name === args.join(' '));
            if (!role)
                return message.channel.send('Give me a valid role name please').then(Utils_1.Utils.deleteMessage);
            if (!user.roles.cache.has(role.id))
                return message.channel.send(`The user doesn\'t has the \`${role.name}\` role`).then(Utils_1.Utils.deleteMessage);
            user.roles.remove(role);
            const embed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setTitle('**Role Added**')
                .setDescription(`**${role.name}** has been succesfully removed from **<@!${user.id}>**`);
            message.channel.send(embed);
        });
    }
};
