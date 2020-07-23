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
const simple_youtube_api_1 = __importDefault(require("simple-youtube-api"));
const Utils_1 = require("../../../Utils");
const youtube = new simple_youtube_api_1.default(process.env.YT_API);
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super('play', {
            aliases: ['p'],
            category: 'music',
            description: 'Play a song or playlist',
            usage: '<Song name or YT url or playlist url>'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const voiceChannel = (_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
            if (!voiceChannel)
                return message.channel.send('You has to be in a voice channel');
            this.handler.player.initPlayer(message.guild.id, message, voiceChannel);
            const voiceChannelUsers = this.handler.player.getMusicaData(message.guild.id).voiceChannel;
            if (voiceChannelUsers && voiceChannel !== voiceChannelUsers)
                return message.channel.send('You have to be in the same channel with music');
            const query = args.join(' ');
            if (!query)
                return message.channel.send('Please give a song name or YT url or playlist url>');
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
                return message.channel.send('Playlist are not allowed');
            }
            if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                const url = query;
                try {
                    let newQuery = query.replace(/(>|<)/gi, '')
                        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                    const id = newQuery[2].split(/[^0-9a-z_\-]/i)[0];
                    const video = yield youtube.getVideoByID(id);
                    if (!video)
                        return message.channel.send('Failed to get video, try again');
                    const title = video.title;
                    let duration = this.formatDuration(video.duration);
                    const thumbnail = video.thumbnails.high.url;
                    if (duration === '00:00')
                        duration = 'Live stream';
                    const song = {
                        url,
                        title,
                        duration,
                        thumbnail,
                        durationSec: video.duration,
                        skipVoteUsers: []
                    };
                    yield this.handler.player.add(message.guild.id, message, song);
                    if (!((_b = musicData) === null || _b === void 0 ? void 0 : _b.isPlaying)) {
                        this.handler.player.play(message.guild.id);
                        message.delete();
                        return message.channel.send(`\`${song.title}\` is ready to play`).then(Utils_1.Utils.deleteMessage);
                    }
                    else {
                        return message.channel.send(`\`${song.title}\` has been added to queue`).then(Utils_1.Utils.deleteMessage);
                    }
                }
                catch (error) {
                    console.error(error);
                    return message.channel.send('Something went wrong try again later').then(Utils_1.Utils.deleteMessage);
                }
            }
            // For query to search
            const videos = yield youtube.searchVideos(query)
                .then((response) => response)
                .catch((error) => console.error(error));
            if (!videos)
                return message.channel.send('We have trouble finding your query please try again');
            const videosNames = [];
            for (let i = 0; i < videos.length; i++) {
                videosNames.push(`${i + 1}: ${videos[i].title}`);
            }
            if (videos.length < 1)
                return message.channel.send('No matches found');
            // Send embed to select song
            const embed = new discord_js_1.MessageEmbed()
                .setColor('GREEN')
                .setTitle('Choose a song by comment a number beetween 1 and 5 or exit to exit');
            for (let i = 0; i < videosNames.length; i++) {
                embed.addField(`Song ${i + 1}`, `${videosNames[i]}`);
            }
            const songEmbed = yield message.channel.send(embed);
            // Fetch response from user
            const filter = (m) => +m.content <= 5 || m.content === 'exit' && m.author.id === message.author.id;
            const userResponse = yield message.channel.awaitMessages(filter, {
                max: 1,
                maxProcessed: 1,
                time: 60000,
                errors: ['time']
            })
                .then(r => r)
                .catch(err => {
                console.error(err);
                songEmbed.delete();
                return message.channel.send('Please try again and enter a number beetween 1 and 5 or exit').then(Utils_1.Utils.deleteMessage);
            });
            // @ts-ignore
            if (userResponse.size === 0) {
                songEmbed.delete();
                return message.channel.send('Please try again and enter a number beetween 1 and 5 or exit');
            }
            // @ts-ignore
            const videoIndex = parseInt(userResponse.first().content);
            // Work the response from the user
            // @ts-ignore
            if (userResponse.first().content === 'exit')
                return songEmbed.delete();
            try {
                var video = yield youtube.getVideoByID(videos[videoIndex - 1].id);
                if (!video)
                    return message.channel.send('Failed to get video, try again');
            }
            catch (err) {
                console.error(err);
                songEmbed.delete();
                return message.channel.send('We have trouble fetching the video please try again');
            }
            // @ts-ignore
            userResponse.first().delete();
            // Get video and data required to play;
            const url = `https://www.youtube.com/watch?v=${video.id}`;
            const title = video.title;
            let duration = this.formatDuration(video.duration);
            const thumbnail = video.thumbnails.high.url;
            if (duration === '00:00')
                duration = 'Live stream';
            const song = {
                url,
                title,
                duration,
                thumbnail,
                durationSec: video.duration,
                skipVoteUsers: []
            };
            yield this.handler.player.add(message.guild.id, message, song);
            if (!((_c = musicData) === null || _c === void 0 ? void 0 : _c.isPlaying)) {
                this.handler.player.play(message.guild.id);
                return songEmbed.delete();
            }
            else {
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle('Song has been added to the queue')
                    .setColor('GREEN')
                    .setThumbnail(song.thumbnail)
                    .addField('Title', `[${song.title}](${song.url})`)
                    .addField('Duration', song.duration);
                message.channel.send(embed);
                return songEmbed.delete();
            }
        });
    }
    formatDuration(duration) {
        if (duration.seconds === 0)
            return '00:00';
        const { hours, minutes, seconds } = duration;
        let durationString = '';
        if (hours > 0)
            duration += `${hours}:`;
        if (minutes > 0) {
            const formated = minutes >= 10 ? minutes : `0${minutes}`;
            durationString += `${formated}:`;
        }
        if (seconds > 0) {
            const formated = seconds >= 10 ? seconds : `0${seconds}`;
            durationString += `${formated}`;
        }
        return durationString;
    }
};
