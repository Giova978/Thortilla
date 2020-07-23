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
const common_tags_1 = require("common-tags");
module.exports = class extends Command_1.default {
    constructor() {
        super('userinfo', {
            aliases: ['whois', 'id'],
            category: 'info',
            description: 'Send the user info',
            usage: '[user]',
        });
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = (Utils_1.Utils.getMember(message, args[0]) || message.member);
            let roles = member === null || member === void 0 ? void 0 : member.roles.cache.map((role) => `\`${role.name}\``);
            // Remove @everyone from roles
            roles === null || roles === void 0 ? void 0 : roles.pop();
            if (!(roles === null || roles === void 0 ? void 0 : roles.length))
                roles = ['None'];
            const embed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setTitle('User Info')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: false }))
                .setDescription(common_tags_1.stripIndent `
            **Username:** ${member === null || member === void 0 ? void 0 : member.user.username}
            **Nickname:** ${(member === null || member === void 0 ? void 0 : member.nickname) || 'None'}
            **Identifier:** #${member === null || member === void 0 ? void 0 : member.user.discriminator}
            **Roles:** ${roles === null || roles === void 0 ? void 0 : roles.join(' ')}
            **Account Created At:** ${Utils_1.Utils.formatTimestamp(member === null || member === void 0 ? void 0 : member.user.createdAt)}
            **Joined At:** ${Utils_1.Utils.formatTimestamp(member === null || member === void 0 ? void 0 : member.joinedAt)}
            [**Avatar UR**](${member.user.displayAvatarURL({ dynamic: false })})
            **Balance:** ${member.getBalance()} coins 
            `);
            message.channel.send(embed);
        });
    }
};
