"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../../handlers/Event"));
const discord_js_1 = require("discord.js");
const Utils_1 = require("../../Utils");
module.exports = class extends Event_1.default {
    constructor({ client, handler }) {
        super("message", "balance");
        this.client = client;
        this.handler = handler;
    }
    run(message) {
        const guild = message.guild;
        if (!guild.getModulesStatus.balance)
            return;
        if (!message.content.startsWith(guild.getPrefix) && !message.author.bot) {
            const member = message.member;
            const chance = !!0.4 && Math.random() <= 0.4;
            if (chance) {
                const coinsAdd = Math.floor(Math.random() * (30 - 5) + 5);
                member.updateBalance(coinsAdd);
                const embed = new discord_js_1.MessageEmbed().setColor("YELLOW").setDescription(`${message.author} you earned ${coinsAdd} coins`);
                message.channel.send(embed).then((msg) => Utils_1.Utils.deleteMessage(msg, 2000));
            }
        }
    }
};
