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
        super('ban', {
            permissions: ["BAN_MEMBERS"],
            category: 'moderation',
            description: 'Ban a user',
            usage: '<user> [reason]',
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const member = Utils_1.Utils.getMember(message, args[0]);
            if (!member)
                return this.handler.error(`I couldn't find ${args[0]}`, message.channel);
            if (!member.bannable)
                return this.handler.error(`I can't ban <@${member.id}>`, message.channel);
            args.shift();
            let reason = args.join(' ');
            if (!reason)
                reason = 'No reason specified';
            const admin = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
            yield member.ban({
                reason
            });
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Ban')
                .setColor('RED')
                .addField('Banned by: ', `<@${admin === null || admin === void 0 ? void 0 : admin.id}>`)
                .addField('Banned: ', `<@${member.id}>`)
                .addField('Reason: ', reason)
                .addField('Date: ', new Date);
            message.channel.send(embed);
        });
    }
};
