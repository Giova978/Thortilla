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
const axios_1 = __importDefault(require("axios"));
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('getmcplayers', {
            aliases: ['gmcp', 'gmc'],
            category: 'info',
            description: 'Gets the player count for the current minecraft server ip',
            usage: 'No arguments'
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = message.guild;
            const ip = guild.getMCAdress();
            if (!ip)
                return message.channel.send('There is no ip');
            const { motd, players } = yield (yield axios_1.default.get(`https://mcapi.us/server/status?ip=${ip}`)).data;
            const embed = new discord_js_1.MessageEmbed()
                .setTitle(`Players in ${motd}`)
                .setColor("GREEN")
                .addField('Players online', `${players.now}/${players.max}`, true);
            message.channel.send(embed);
        });
    }
};
