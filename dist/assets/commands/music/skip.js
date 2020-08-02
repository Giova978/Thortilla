"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../../handlers/Command"));
const discord_js_1 = require("discord.js");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('skip', {
            aliases: ['s'],
            category: 'music',
            description: 'Skip the current song',
            usage: '<f for force skip(need PRIORITY_SPEAKER)>'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        const musicData = this.handler.player.getMusicaData(message.guild.id);
        if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) !== musicData.voiceChannel)
            return message.channel.send('You have to be in the same voice channel of the song');
        if (!musicData)
            return message.channel.send('There is no song playing');
        if (musicData.queue.length === 0)
            return message.channel.send('There is no song to skip');
        if (args[0] === 'f' && message.member.hasPermission("PRIORITY_SPEAKER")) {
            this.handler.player.skip(message.guild.id);
            return message.channel.send('Skipped!');
        }
        if (musicData.nowPlaying.skipVoteUsers.includes(message.member.id))
            return message.channel.send('You cant vote twice');
        if (musicData.voiceChannel.members.size <= 2) {
            this.handler.player.skip(message.guild.id);
            return message.channel.send('Skipped!');
        }
        musicData.skipVotes++;
        const trueMembers = musicData.player.options.voiceChannel.members.map(member => !member.user.bot);
        const requiredVotes = Math.ceil(trueMembers.length / 2);
        if (musicData.skipVotes >= requiredVotes) {
            this.handler.player.skip(message.guild.id);
            return message.channel.send('Skipped!');
        }
        musicData.nowPlaying.skipVoteUsers.push(message.member.id);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Skip votes')
            .setColor('GREEN')
            .addField('Skip', `${musicData.skipVotes}/${requiredVotes}`);
        message.channel.send(embed);
    }
};
