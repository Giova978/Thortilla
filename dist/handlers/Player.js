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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const lavajs_1 = require("@anonymousg/lavajs");
class Player {
    constructor(lavaClient, handler) {
        this.guildsMusicData = new discord_js_1.Collection();
        this.options = (message, voiceChannel) => {
            return {
                guild: message.guild,
                // @ts-ignore
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                deafen: true,
                queueRepeat: false,
                skipOnError: false,
                trackRepeat: false,
            };
        };
        this.lavaClient = lavaClient;
        this.handler = handler;
        this.setListeners();
    }
    initPlayer(guildId, message, voiceChannel) {
        const player = this.lavaClient.spawnPlayer(this.options(message, voiceChannel));
        if (!this.guildsMusicData.has(guildId)) {
            this.guildsMusicData.set(guildId, this.initMusicData(guildId, player, voiceChannel, message));
        }
    }
    getMusicaData(guildId) {
        var _a;
        return _a = this.guildsMusicData.get(guildId), (_a !== null && _a !== void 0 ? _a : {});
    }
    add(guildId, message, song) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = this.getMusicaData(guildId);
            data.queue.push(song);
            yield data.player.lavaSearch(song.url, message.author, true);
            this.guildsMusicData.set(guildId, data);
        });
    }
    play(guildId) {
        let data = this.getMusicaData(guildId);
        if (data.timeout)
            clearTimeout(data.timeout);
        if (!data.isPlaying) {
            data.player.play();
            data.isPlaying = true;
        }
        this.guildsMusicData.set(guildId, data);
    }
    skip(guildId, index = 0) {
        let data = this.getMusicaData(guildId);
        if (index > 0) {
            data.player.queue.moveTrack(index, 1);
            data.queue.unshift(data.queue[index]);
        }
        data.player.play();
    }
    initMusicData(guildId, player, voiceChannel, message) {
        return {
            guildId: guildId,
            player: player,
            queue: [],
            volume: 50,
            skipVotes: 0,
            nowPlaying: null,
            isPlaying: false,
            voiceChannel: voiceChannel,
            // @ts-ignore
            textChannel: message.channel,
            timeout: null,
        };
    }
    leave(guildId, player) {
        let data = this.getMusicaData(guildId);
        data.isPlaying = false;
        data.timeout = setTimeout(() => {
            // @ts-ignore
            new lavajs_1.LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
                op: "leave",
                guil_id: guildId,
            });
            player.destroy();
            this.guildsMusicData.delete(guildId);
        }, 300000);
        this.guildsMusicData.set(guildId, data);
    }
    setListeners() {
        let musicData;
        let queue;
        let channel;
        this.lavaClient
            .on("trackPlay", (track, player) => {
            musicData = this.getMusicaData(player.options.guild.id);
            queue = musicData.queue;
            channel = musicData.textChannel;
            musicData.skipVotes = 0;
            player.setVolume(musicData.volume);
            const embed = new discord_js_2.MessageEmbed().setTitle("Current Song").setColor("GREEN").addField("Now playing", `[${queue[0].title}](${queue[0].url})`).addField("Duration", queue[0].duration);
            if (queue[0].thumbnail)
                embed.setThumbnail(queue[0].thumbnail);
            if (queue[1])
                embed.addField("Next song", queue[1].title);
            channel.send(embed);
            musicData.nowPlaying = queue[0];
            queue.shift();
            this.guildsMusicData.set(player.options.guild.id, musicData);
        })
            .on("trackOver", (track, player) => {
            musicData = this.getMusicaData(player.options.guild.id);
            queue = musicData.queue;
            if (queue.length > 0) {
                player.play();
            }
            else {
                this.leave(player.options.guild.id, player);
            }
        })
            .on("queueOver", (player) => {
            musicData = this.getMusicaData(player.options.guild.id);
            queue = musicData.queue;
            if (queue.length > 0) {
                player.play();
            }
            else {
                this.leave(player.options.guild.id, player);
            }
        })
            .on("trackError", (track, player, err) => {
            musicData = this.getMusicaData(player.options.guild.id);
            queue = musicData.queue;
            channel = musicData.textChannel;
            console.error("Error", err);
            player.stop();
            channel.send("There was a problem with the playback");
            if (queue.length < 1) {
                this.leave(player.options.guild.id, player);
            }
            else {
                player.play();
            }
        });
    }
}
exports.default = Player;
