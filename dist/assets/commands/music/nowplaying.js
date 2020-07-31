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
const common_tags_1 = require("common-tags");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super("nowplaying", {
            aliases: ["np"],
            category: "music",
            description: "Shows the current song",
            usage: "No arguments",
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (!musicData)
                return message.channel.send("There is no song playing");
            if (!musicData.nowPlaying)
                return message.channel.send("There is no song playing");
            const song = musicData.nowPlaying;
            let description;
            if (((_a = song) === null || _a === void 0 ? void 0 : _a.duration) === "Live stream") {
                description = "Live stream";
            }
            else {
                description = this.getDurationBar(musicData, song);
            }
            const embed = new discord_js_1.MessageEmbed().setTitle("Current song").setColor("GREEN").setDescription(description);
            message.channel.send(embed);
        });
    }
    getDurationBar(musicData, song) {
        const currentTimeMS = musicData.player.position;
        const currentTime = {
            seconds: Math.floor(currentTimeMS / 1000),
            minutes: Math.floor(currentTimeMS / (1000 * 60)),
            hours: Math.floor(currentTimeMS / (1000 * 60 * 60)),
        };
        const durationFormmatted = this.formatDuration(currentTime);
        let tempDescription = common_tags_1.stripIndent `
                                **[${song.title}](${song.url})**

                                ${durationFormmatted}  `;
        const timePassedPer = Math.floor((currentTime.seconds / this.getRawDuration(song.durationSec)) * 20);
        for (let i = 0; i < 20; i++) {
            if (i === timePassedPer || (i === 0 && timePassedPer < 1)) {
                tempDescription += "🔘";
                continue;
            }
            tempDescription += "▬";
        }
        tempDescription += ` ${song.duration}`;
        return tempDescription;
    }
    formatDuration(duration) {
        if (duration.seconds === 0)
            return "00:00";
        let { hours, minutes, seconds } = duration;
        seconds = seconds - minutes * 60;
        minutes = minutes - hours * 60;
        let durationString = "";
        if (hours > 0)
            duration += `${hours}:`;
        let formated = minutes >= 10 ? minutes : `0${minutes}`;
        durationString += `${formated}:`;
        formated = seconds >= 10 ? seconds : `0${seconds}`;
        durationString += `${formated}`;
        return durationString;
    }
    getRawDuration(duration) {
        const { hours, minutes, seconds } = duration;
        return hours * 60 * 60 + minutes * 60 + seconds;
    }
};
