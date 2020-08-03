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
        super('skipto', {
            aliases: ['sto'],
            category: 'music',
            description: 'Skip to a song specified in the queue',
            usage: '<Song index>'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            ;
            if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) !== (musicData === null || musicData === void 0 ? void 0 : musicData.voiceChannel))
                return this.handler.error('You have to be in the same voice channel of the song', message.channel);
            if (!musicData)
                return this.handler.error('There is no song playing', message.channel);
            if (musicData.queue.length === 0)
                return this.handler.error('There is no song to skip', message.channel);
            const queueIndex = parseInt(args[0]);
            if (!queueIndex || queueIndex < 1 || queueIndex > 5)
                return this.handler.error('Please enter a valid queue index', message.channel);
            if (args[1] === 'f' && message.member.hasPermission("PRIORITY_SPEAKER")) {
                this.handler.player.skip(message.guild.id, queueIndex);
                return message.channel.send(`Skipped to ${queueIndex}!`);
            }
            if (musicData.nowPlaying.skipVoteUsers.includes(message.member.id))
                return this.handler.error('You cant vote twice', message.channel);
            if (musicData.voiceChannel.members.size < 2) {
                this.handler.player.skip(message.guild.id, queueIndex);
                return message.channel.send(`Skipped to ${queueIndex}!`);
            }
            musicData.skipVotes++;
            const trueMembers = musicData.player.options.voiceChannel.members.map(member => !member.user.bot);
            const requiredVotes = Math.ceil(trueMembers.length / 2);
            if (musicData.skipVotes >= requiredVotes) {
                this.handler.player.skip(message.guild.id, queueIndex);
                return message.channel.send(`Skipped to ${queueIndex}!`);
            }
            musicData.nowPlaying.skipVoteUsers.push(message.member.id);
            const song = musicData.queue[queueIndex];
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Skip votes')
                .setColor('GREEN')
                .addField(`Skip to ${song.title}`, `${musicData.skipVotes}/${requiredVotes}`)
                .setThumbnail(song.thumbnail);
            message.channel.send(embed);
        });
    }
};
