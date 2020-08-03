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
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('queue', {
            aliases: ['q'],
            category: 'music',
            description: 'Show the current queue',
            usage: 'No arguments'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            ;
            if (!musicData || musicData.queue.length === 0)
                return this.handler.error('There is no queue', message.channel);
            const embed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setTitle('Queue')
                .setTimestamp()
                .setAuthor((_a = this.handler.client.user) === null || _a === void 0 ? void 0 : _a.username, (_b = this.handler.client.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL());
            let description = '';
            musicData.queue.forEach((song, index) => {
                description += `\n\`${index}\`[${song.title}](${song.url}) ${song.duration}`;
            });
            embed.setDescription(description);
            message.channel.send(embed);
        });
    }
};
